using { Currency, custom.managed, sap.common.CodeList } from './common';
using {
  sap.fe.cap.travel.Airline,
  sap.fe.cap.travel.Passenger,
  sap.fe.cap.travel.TravelAgency,
  sap.fe.cap.travel.Supplement,
  sap.fe.cap.travel.Flight
 } from './master-data';

namespace sap.fe.cap.travel;

entity Travel : managed {
  key TravelUUID : UUID;
  TravelID       : Integer @readonly default 0;
  BeginDate      : Date;
  EndDate        : Date;
  BookingFee     : Decimal(16, 3);
  TotalPrice     : Decimal(16, 3) @readonly;
  CurrencyCode   : Currency;
  Description    : String(1024);
  TravelStatus   : Association to TravelStatus  @readonly;
  GoGreen        : Boolean default false;
  GreenFee       : Decimal(16, 3) @Core.Computed @readonly;
  TreesPlanted   : Integer @Core.Computed @readonly;  
  to_Agency      : Association to TravelAgency;
  to_Customer    : Association to Passenger;
  to_Booking     : Composition of many Booking on to_Booking.to_Travel = $self;
};
entity Booking : managed {
  key BookingUUID   : UUID;
  BookingID         : Integer @Core.Computed;
  BookingDate       : Date;
  ConnectionID      : String(4);
  FlightDate        : Date;
  FlightPrice       : Decimal(16, 3);
  CurrencyCode      : Currency;
  BookingStatus     : Association to BookingStatus;
  to_BookSupplement : Composition of many BookingSupplement on to_BookSupplement.to_Booking = $self;
  to_Carrier        : Association to Airline;
  to_Customer       : Association to Passenger;
  to_Travel         : Association to Travel;
  to_Flight         : Association to Flight on  to_Flight.AirlineID = to_Carrier.AirlineID
                                            and to_Flight.FlightDate = FlightDate
                                            and to_Flight.ConnectionID = ConnectionID;
};

entity BookingSupplement : managed {
  key BookSupplUUID   : UUID;
  BookingSupplementID : Integer @Core.Computed;
  Price               : Decimal(16, 3);
  CurrencyCode        : Currency;
  to_Booking          : Association to Booking;
  to_Travel           : Association to Travel;
  to_Supplement       : Association to Supplement;
};

//
//  Code Lists
//

entity BookingStatus : CodeList {
  key code : String enum {
    New      = 'N';
    Booked   = 'B';
    Canceled = 'X';
  };
};

entity TravelStatus : CodeList {
  key code : String enum {
    Open     = 'O';
    Accepted = 'A';
    Canceled = 'X';
  } default 'O'; //> will be used for foreign keys as well
  criticality : Integer; //  2: yellow colour,  3: green colour, 0: unknown
  fieldControl: Integer @odata.Type:'Edm.Byte'; // 1: #ReadOnly, 7: #Mandatory
  createDeleteHidden: Boolean;
}

//TechEd extensions

//Exercise 5: Bookings table micro chart
extend Booking with {
  criticality    : Integer default 0 @Core.Computed @UI.Hidden; 
  BookedFlights: Integer @Core.Computed;  
  EligibleForPrime: Integer @Core.Computed @UI.Hidden;
};

extend Airline with {
  VIPCustomerBookings : Integer;
};

//Exercise 6: Using the Chart Building Block
define view BookedFlights as select from Booking left join Airline on Airline.AirlineID = Booking.to_Carrier.AirlineID  {
  key to_Customer.CustomerID as to_Customer_CustomerID, key AirlineID, to_Customer.LastName as LastName, BookingUUID, Name, VIPCustomerBookings, to_Travel
};

define view HighestTotal as select from Travel left join Passenger on Passenger.CustomerID = Travel.to_Customer.CustomerID {
  key TravelID ,to_Customer.CustomerID as to_Customer_CustomerID, Description, CurrencyCode.code as CurrencyCode, to_Customer.LastName as LastName, TotalPrice, TravelStatus.code
} where TotalPrice >= 22000 and TravelStatus.code = 'O';

extend Travel with {
  to_BookedFlights : Association to many BookedFlights on to_BookedFlights.to_Travel = $self @readonly;  
};

