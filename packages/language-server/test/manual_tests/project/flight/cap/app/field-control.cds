using TravelService from '../srv/travel-service';

//
// annotations that control the behavior of fields and actions
//

// Workarounds for overly strict OData libs and clients

annotate cds.UUID with @Core.Computed  @odata.Type : 'Edm.String';

annotate TravelService.Travel {
  BookingFee    @Common.FieldControl  : TravelStatus.fieldControl;
  BeginDate       @Common.FieldControl  : TravelStatus.fieldControl;
  EndDate         @Common.FieldControl  : TravelStatus.fieldControl;
  to_Agency       @Common.FieldControl  : TravelStatus.fieldControl;
  to_Customer     @Common.FieldControl  : TravelStatus.fieldControl;

  } actions {
  rejectTravel @(
    Core.OperationAvailable : { $edmJson: { $Ne: [{ $Path: 'in/TravelStatus_code'}, 'X']}},
    Common                  : {SideEffects : {
      $Type            : 'Common.SideEffectsType',
      TargetProperties : ['in/TravelStatus_code'],
      TargetEntities   : ['/TravelService.EntityContainer/Travel']
    }}
  );
  acceptTravel @(
    Core.OperationAvailable : { $edmJson: { $Ne: [{ $Path: 'in/TravelStatus_code'}, 'A']}},
    Common                  : {SideEffects : {
      $Type            : 'Common.SideEffectsType',
      TargetProperties : ['in/TravelStatus_code'],
      TargetEntities   : ['/TravelService.EntityContainer/Travel']
    }}
  );
}

annotate TravelService.Travel with @Common : {SideEffects #GoGreen : {
  $Type            : 'Common.SideEffectsType',
  SourceProperties : [GoGreen],
  TargetProperties : ['TotalPrice', 'GreenFee', 'TreesPlanted']
},
SideEffects #BookingFee: {
  SourceProperties: [BookingFee],
  TargetProperties: ['TotalPrice']
},
SideEffects #Bookings: {
  $Type            : 'Common.SideEffectsType',
  SourceEntities : [to_Booking],
  TargetProperties : ['TotalPrice']
}};

annotate TravelService.Booking with @UI.CreateHidden : to_Travel.TravelStatus.createDeleteHidden;

annotate TravelService.Booking {

  BookingDate   @Core.Computed;
  ConnectionID  @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  FlightDate    @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  FlightPrice   @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  BookingStatus @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Carrier    @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Customer   @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
};

annotate TravelService.BookingSupplement {
  Price         @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Supplement @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Booking          @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Travel           @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;

};

annotate Currency with @Common.UnitSpecificScale : 'Decimals';


