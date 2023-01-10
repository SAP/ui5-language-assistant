const cds = require("@sap/cds");
require("./workarounds");

class TravelService extends cds.ApplicationService {
  init() {
    /**
     * Reflect definitions from the service's CDS model
     */
    const {
      Travel,
      Booking,
      BookingSupplement,
      Flight,
      Airline,
    } = this.entities;

    /**
     * Fill in primary keys for new Travels.
     * Note: In contrast to Bookings and BookingSupplements that has to happen
     * upon SAVE, as multiple users could create new Travels concurrently.
     */
    this.before("CREATE", "Travel", async (req) => {
      const { maxID } = await SELECT.one`max(TravelID) as maxID`.from(Travel);
      req.data.TravelID = maxID + 1;
    });

    /**
     * Fill in defaults for new Bookings when editing Travels.
     */
    this.before("NEW", "Booking", async (req) => {
      const { to_Travel_TravelUUID } = req.data;
      const { status } = await SELECT`TravelStatus_code as status`.from(
        Travel.drafts,
        to_Travel_TravelUUID
      );
      if (status === "X")
        throw req.reject(400, "Cannot add new bookings to rejected travels.");
      const { maxID } = await SELECT.one`max(BookingID) as maxID`
        .from(Booking.drafts)
        .where({ to_Travel_TravelUUID });
      req.data.BookingID = maxID + 1;
      req.data.BookingStatus_code = "N";
      req.data.BookingDate = new Date().toISOString().slice(0, 10); // today
    });

    /**
     * Fill in defaults for new BookingSupplements when editing Travels.
     */
    this.before("NEW", "BookingSupplement", async (req) => {
      const { to_Booking_BookingUUID } = req.data;
      const {
        maxID,
      } = await SELECT.one`max(BookingSupplementID) as maxID`
        .from(BookingSupplement.drafts)
        .where({ to_Booking_BookingUUID });
      req.data.BookingSupplementID = maxID + 1;
    });

    /**
     * Changing Booking Fees is only allowed for not yet accapted Travels.
     */
    this.before("PATCH", "Travel", async (req) => {
      if ("BookingFee" in req.data) {
        const { status } = await SELECT`TravelStatus_code as status`.from(
          req._target
        );
        if (status === "A")
          req.reject(
            400,
            "Booking fee can not be updated for accepted travels.",
            "BookingFee"
          );
      }
    });

    /**
     * Update the Travel's TotalPrice when its BookingFee is modified.
     */
    this.after("PATCH", "Travel", (_, req) => {
      if ("BookingFee" in req.data) {
        return this._update_totals4(req.data.TravelUUID);
      }
    });

    /**
     * Update the Travel's TotalPrice when a Booking's FlightPrice is modified.
     */
    this.after("PATCH", "Booking", async (_, req) => {
      if ("FlightPrice" in req.data) {
        // We need to fetch the Travel's UUID for the given Booking target
        const {
          travel,
        } = await SELECT.one`to_Travel_TravelUUID as travel`.from(req._target);
        return this._update_totals4(travel);
      }
    });

    /**
     * Update the Travel's TotalPrice when a Supplement's Price is modified.
     */
    this.after("PATCH", "BookingSupplement", async (_, req) => {
      if ("Price" in req.data) {
        // We need to fetch the Travel's UUID for the given Supplement target
        const {
          travel,
        } = await SELECT.one`to_Travel_TravelUUID as travel`.from(
          Booking.drafts
        ).where`BookingUUID = ${SELECT.one`to_Booking_BookingUUID`
          .from(BookingSupplement.drafts)
          .where({ BookSupplUUID: req.data.BookSupplUUID })}`;
        // .where `BookingUUID = ${ SELECT.one `to_Booking_BookingUUID` .from (req._target) }`
        //> REVISIT: req._target not supported for subselects -> see tests
        return this._update_totals4(travel);
      }
    });

    /**
     * Update the Travel's TotalPrice when a Booking Supplement is deleted.
     */
    this.on("CANCEL", BookingSupplement, async (req, next) => {
      // Find out which travel is affected before the delete
      const { DraftAdministrativeData_DraftUUID, BookSupplUUID } = req.data;
      const {
        to_Travel_TravelUUID,
      } = await SELECT.one
        .from(BookingSupplement.drafts, ["to_Travel_TravelUUID"])
        .where({ DraftAdministrativeData_DraftUUID, BookSupplUUID });
      // Delete handled by generic handlers
      const res = await next();
      // After the delete, update the totals
      await this._update_totals4(to_Travel_TravelUUID);
      return res;
    });

    /**
     * Update the Travel's TotalPrice when a Booking is deleted.
     */
    this.on("CANCEL", Booking, async (req, next) => {
      // Find out which travel is affected before the delete
      const { DraftAdministrativeData_DraftUUID, BookingUUID } = req.data;
      const { to_Travel_TravelUUID } = await SELECT.one
        .from(Booking.drafts, ["to_Travel_TravelUUID"])
        .where({ DraftAdministrativeData_DraftUUID, BookingUUID });
      // Delete handled by generic handlers
      const res = await next();
      // After the delete, update the totals
      await this._update_totals4(to_Travel_TravelUUID);
      return res;
    });

    /**
     * Helper to re-calculate a Travel's TotalPrice from BookingFees, FlightPrices and Supplement Prices.
     */
    this._update_totals4 = function (travel) {
      return UPDATE(Travel.drafts, travel).with({
        TotalPrice: CXL`coalesce (BookingFee, 0) + ${SELECT`coalesce (sum (FlightPrice + ${SELECT`coalesce (sum (Price),0)`.from(
          BookingSupplement.drafts
        ).where`to_Booking_BookingUUID = BookingUUID`}),0)`.from(Booking.drafts)
          .where`to_Travel_TravelUUID = TravelUUID`}`,
      });
    };

    /**
     * Validate a Travel's edited data before save.
     */
    this.before("SAVE", "Travel", (req) => {
      const {
          BeginDate,
          EndDate,
          BookingFee,
          to_Agency_AgencyID,
          to_Customer_CustomerID,
          to_Booking,
          TravelStatus_code,
        } = req.data,
        today = new Date().toISOString().slice(0, 10);

      // validate only not rejected travels
      if (TravelStatus_code !== "X") {
        if (BookingFee == null)
          req.error(400, "Enter a booking fee", "in/BookingFee"); // 0 is a valid BookingFee
        if (!BeginDate) req.error(400, "Enter a begin date", "in/BeginDate");
        if (!EndDate) req.error(400, "Enter an end date", "in/EndDate");
        if (!to_Agency_AgencyID)
          req.error(400, "Enter a travel agency", "in/to_Agency_AgencyID");
        if (!to_Customer_CustomerID)
          req.error(400, "Enter a customer", "in/to_Customer_CustomerID");

        for (const booking of to_Booking) {
          const {
            BookingUUID,
            ConnectionID,
            FlightDate,
            FlightPrice,
            BookingStatus_code,
            to_Carrier_AirlineID,
            to_Customer_CustomerID,
          } = booking;
          if (!ConnectionID)
            req.error(
              400,
              "Enter a flight",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/ConnectionID`
            );
          if (!FlightDate)
            req.error(
              400,
              "Enter a flight date",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/FlightDate`
            );
          if (!FlightPrice)
            req.error(
              400,
              "Enter a flight price",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/FlightPrice`
            );
          if (!BookingStatus_code)
            req.error(
              400,
              "Enter a booking status",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/BookingStatus_code`
            );
          if (!to_Carrier_AirlineID)
            req.error(
              400,
              "Enter an airline",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_Carrier_AirlineID`
            );
          if (!to_Customer_CustomerID)
            req.error(
              400,
              "Enter a customer",
              `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_Customer_CustomerID`
            );

          for (const suppl of booking.to_BookSupplement) {
            const { BookSupplUUID, Price, to_Supplement_SupplementID } = suppl;
            if (!Price)
              req.error(
                400,
                "Enter a price",
                `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_BookSupplement(BookSupplUUID='${BookSupplUUID}',IsActiveEntity=false)/Price`
              );
            if (!to_Supplement_SupplementID)
              req.error(
                400,
                "Enter a supplement",
                `in/to_Booking(BookingUUID='${BookingUUID}',IsActiveEntity=false)/to_BookSupplement(BookSupplUUID='${BookSupplUUID}',IsActiveEntity=false)/to_Supplement_SupplementID`
              );
          }
        }
      }

      if (BeginDate < today)
        req.error(
          400,
          `Begin Date ${BeginDate} must not be before today ${today}.`,
          "in/BeginDate"
        );
      if (BeginDate > EndDate)
        req.error(
          400,
          `Begin Date ${BeginDate} must be before End Date ${EndDate}.`,
          "in/BeginDate"
        );
    });

    //
    // Action Implementations...
    //

    this.on("acceptTravel", (req) =>
      UPDATE(req._target).with({ TravelStatus_code: "A" })
    );
    this.on("rejectTravel", (req) =>
      UPDATE(req._target).with({ TravelStatus_code: "X" })
    );

    /**
     * Trees-for-Tickets: update totals including green flight fee
     */
    this._update_totalsGreen = async function (req) {
      const [{ TotalPrice }] = await cds.read([
        SELECT.one`TotalPrice, GreenFee`.from(
          Travel.drafts,
          req.data.TravelUUID
        ),
      ]);
      if (req.data.GoGreen) {
        req.info({
          code: 204,
          message:
            "Trees-4-Tickets: " +
            Math.round(TotalPrice * 0.01, 0) +
            " tree plants scheduled",
          numericSeverity: 1,
        });
        return UPDATE(Travel.drafts, req.data.TravelUUID).with(`
    TotalPrice = TotalPrice + round (TotalPrice * 0.01, 0),
    GreenFee = round (TotalPrice * 0.01, 0),
    TreesPlanted = round(TotalPrice * 0.01, 0)
  `);
      } else {
        this._update_totals4(req.data.TravelUUID);
        return UPDATE(Travel.drafts, req.data.TravelUUID).with(`
      TotalPrice = TotalPrice - GreenFee,
      GreenFee = 0,
      TreesPlanted = 0
    `);
      }
    };

    /**
     * Trees-forTickets: Set criticality to highlight green flight status in booking table
     */
    async function setCriticality(BookingItems) {
      function _setCriticality(BookingItem, GoGreen) {
        if (GoGreen) {
          BookingItem.criticality = parseInt(3);
        } else {
          BookingItem.criticality = parseInt(0);
        }
      }
      if (BookingItems != null) {
        var TravelTarget;
        var BookingTarget;
        var IsActiveEntity;
        var BookingUUID;
        if (Array.isArray(BookingItems) && BookingItems.length > 0) {
          IsActiveEntity = BookingItems[0].IsActiveEntity;
          BookingUUID = BookingItems[0].BookingUUID;
        } else {
          IsActiveEntity = BookingItems.IsActiveEntity;
          BookingUUID = BookingItems.BookingUUID;
        }
        if (IsActiveEntity) {
          TravelTarget = Travel;
          BookingTarget = Booking;
        } else {
          TravelTarget = Travel.drafts;
          BookingTarget = Booking.drafts;
        }

        const {
          travel,
        } = await SELECT.one`to_Travel_TravelUUID as travel`.from(
          BookingTarget,
          BookingUUID
        );
        const [{ GoGreen }] = await cds.read([
          SELECT.one`GoGreen`.from(TravelTarget).where({ TravelUUID: travel }),
        ]);
        if (Array.isArray(BookingItems)) {
          BookingItems.forEach((item) => _setCriticality(item, GoGreen));
        } else {
          _setCriticality(BookingItems, GoGreen);
        }
      }
    }

    /**
     * Trees-for-Tickets: Update totals including green flight fee
     */
    this.after("PATCH", "Travel", (_, req) => {
      if ("GoGreen" in req.data) {
        return this._update_totalsGreen(req);
      }
    });

    /**
     * Trees-for-Tickets: Set criticality
     */

    this.after("READ", "Booking", (results, req) => {
      if (results.length > 0 && "BookingUUID" in results[0]) {
        return setCriticality(results);
      }
    });

    /**
     * Exercise 5: Data for Bookings table micro chart
     */
    const _readBookings = async (context, each) => {
      return await cds.tx(context).read([
        SELECT`to_Carrier_AirlineID as AirlineID, count(BookingUUID) as BookedFlights`.from(
          Booking
        ).groupBy`to_Customer_CustomerID, to_Carrier_AirlineID`.having({
          to_Customer_CustomerID: each.to_Customer_CustomerID,
        }),
        SELECT`AirlineID, Name`.from(Airline),
      ]);
    };

    const _readBookedFlightsSingleAirline = async (bookedFlights, context) => {
      for (const each of bookedFlights) {
        if (each.to_Customer === null) {
          continue;
        }
        await _readBookings(context, each).then((result) => {
          if (result[0].length > 0 && each.to_Carrier != undefined) {
            var bookings = result[0];
            let booking = bookings.find(
              (obj) => obj.AirlineID === each.to_Carrier_AirlineID
            );
            each.BookedFlights =
              booking != undefined ? booking.BookedFlights : 0;

            //Threshold of 5 booked flights reached: set chart color green (3) or red(1)
            each.EligibleForPrime =
              each.BookedFlights >= each.to_Carrier.VIPCustomerBookings ? 3 : 1;
          }
        });
      }
    };

    this.on("READ", "Booking", async (context, next) => {
      var bookings = await next();
      if (
        bookings != null &&
        context.query.SELECT.columns &&
        context.query.SELECT.columns.find((c) => c.ref[0] === "BookedFlights")
      ) {
        if (Array.isArray(bookings)) {
          return await _readBookedFlightsSingleAirline(bookings, context);
        } else {
          return await _readBookedFlightsSingleAirline([bookings], context);
        }
      }
      return bookings;
    });

    /**
     * Exercise 7: Custom Section Chart Building Block
     */
    this.on("READ", "BookedFlights", async (context, next) => {
      var bookedFlights = await next();
      if (
        context.query.SELECT.columns &&
        context.query.SELECT.columns.find((c) => c.as === "CountFlights")
      ) {
        return [
          ...new Set(
            await await _readBookedFlightsAllAirlines(
              bookedFlights.filter(
                (obj) =>
                  obj.to_Customer_CustomerID != null && obj.AirlineID != null
              ),
              context
            )
          ),
        ];
      }
      return bookedFlights;
    });

    const _readBookedFlightsAllAirlines = async (bookedFlights, context) => {
      var flightsPerCustomer = [];
      for (const each of bookedFlights) {
        if (each.to_Customer_CustomerID === null) {
          continue;
        }
        await _readBookings(context, each).then((result) => {
          var bookings = result[0];
          var airlines = result[1];
          for (const flightsPerAirline of bookings) {
            var record = {};
            record.CountFlights = flightsPerAirline.BookedFlights;
            record.AirlineID = flightsPerAirline.AirlineID;
            record.to_Customer_CustomerID = each.to_Customer_CustomerID;
            record.LastName = each.LastName;
            record.Name = airlines.find(
              (obj) => obj.AirlineID === flightsPerAirline.AirlineID
            ).Name;
            flightsPerCustomer.push(record);
          }
        });
      }
      return flightsPerCustomer;
    };

    // Add base class's handlers. Handlers registered above go first.
    return super.init();
  }
}
module.exports = { TravelService };
