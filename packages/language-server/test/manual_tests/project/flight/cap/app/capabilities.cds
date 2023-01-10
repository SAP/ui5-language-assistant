using {TravelService} from '../srv/travel-service';

annotate TravelService.Travel with @odata.draft.enabled;
annotate TravelService.Travel with @Common.SemanticKey: [TravelID];
annotate TravelService.Booking with @Common.SemanticKey: [BookingID];
annotate TravelService.BookingSupplement with @Common.SemanticKey: [BookingSupplementID];

annotate TravelService.Travel with @Capabilities : { 
  InsertRestrictions : {
    $Type : 'Capabilities.InsertRestrictionsType',
    Insertable: false,
  },
  DeleteRestrictions : {
      $Type : 'Capabilities.DeleteRestrictionsType',
      Deletable: false,
  }
 };

annotate TravelService.Booking with @Capabilities : { 
  DeleteRestrictions : {
      $Type : 'Capabilities.DeleteRestrictionsType',
      Deletable: false
  }
 };

//Exercise 7: Aggregation Capabilities
annotate TravelService.BookedFlights with @(
  Aggregation.ApplySupported: {
    $Type : 'Aggregation.ApplySupportedType',
    Transformations : [
        'aggregate',
        'groupby'
    ],
    Rollup : #None,
    GroupableProperties : [
        to_Customer_CustomerID, AirlineID
    ],
    AggregatableProperties : [
        {
            $Type : 'Aggregation.AggregatablePropertyType',
            Property : BookingUUID 
        },
    ],
  },
  Analytics.AggregatedProperties : [{
    Name : 'CountFlights',
    AggregationMethod : 'countdistinct',
    AggregatableProperty : BookingUUID,
    ![@Common.Label] : 'Booked Flights per Airline',
  }]);