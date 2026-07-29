using TravelService as service from '../../srv/travel-service';
using from '../../db/schema';
using from '../capabilities';

annotate service.Travel with @(
    UI.SelectionFields : [
     to_Agency_AgencyID,
     to_Customer_CustomerID,
     TravelStatus_code   
    ],
    UI.LineItem  : [
        {
            $Type : 'UI.DataField',
            Value : TravelID,
        },
        {
            $Type : 'UI.DataField',
            Value : TravelStatus_code,
            Criticality : TravelStatus.criticality,
        },
        {
            $Type : 'UI.DataField',
            Value : BeginDate,
        },
        {
            $Type : 'UI.DataField',
            Value : EndDate,
        },
        {
            $Type : 'UI.DataField',
            Value : to_Agency_AgencyID,
        },
        {
            $Type : 'UI.DataField',
            Value : to_Customer_CustomerID,
        },
        {
            $Type : 'UI.DataField',
            Value : TotalPrice,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Label : '{i18n>AcceptTravel}',
            Action : 'TravelService.acceptTravel',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Label : '{i18n>RejectTravel}',
            Action : 'TravelService.rejectTravel',
        },
    ]
);
annotate service.Travel with @(
    UI.HeaderInfo : {
        TypeName : '{i18n>Travel}',
        TypeNamePlural : 'Travels',
        Title : {
            $Type : 'UI.DataField',
            Value : Description,
        },
        Description : {
            $Type : 'UI.DataField',
            Value : TravelID,
        },
    }
);
annotate service.Travel with @(
    UI.Facets : [
        {
            $Type : 'UI.CollectionFacet',
            Label : '{i18n>Travel}',
            ID : 'i18nTraveldata',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>Travel}',
                    ID : 'i18nTraveldata',
                    Target : '@UI.FieldGroup#i18nTraveldata',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>Prices}',
                    ID : 'PriceData',
                    Target : '@UI.FieldGroup#PriceData',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>Dates}',
                    ID : 'i18nDatedata',
                    Target : '@UI.FieldGroup#i18nDatedata',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>Sustainability}',
                    ID : 'i18nSustainability',
                    Target : '@UI.FieldGroup#i18nSustainability',
                },],
        },]
);

annotate service.Travel with @(
    UI.FieldGroup #i18nTraveldata : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : TravelID,
            },{
                $Type : 'UI.DataField',
                Value : to_Agency_AgencyID,
            },{
                $Type : 'UI.DataField',
                Value : to_Customer_CustomerID,
            },{
                $Type : 'UI.DataField',
                Value : Description,
            },{
                $Type : 'UI.DataField',
                Value : TravelStatus_code,
                Criticality : TravelStatus.criticality,
            },],
    }
);
annotate service.Travel with @(
    UI.FieldGroup #PriceData : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : BookingFee,
            },{
                $Type : 'UI.DataField',
                Value : TotalPrice,
            },],
    }
);
annotate service.Travel with @(
    UI.FieldGroup #i18nDatedata : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : BeginDate,
            },{
                $Type : 'UI.DataField',
                Value : EndDate,
            },],
    }
);
annotate service.Travel with {
    Description @UI.MultiLineText : true
};
annotate service.Travel with @(
    UI.FieldGroup #i18nSustainability : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : GoGreen,
            },{
                $Type : 'UI.DataField',
                Value : GreenFee,
            },{
                $Type : 'UI.DataField',
                Value : TreesPlanted,
            },],
    }
);
annotate service.Booking with @(
    UI.LineItem #i18nBooking : [
        {
            $Type : 'UI.DataField',
            Value : to_Carrier.AirlinePicURL,
            Label : 'AirlinePicURL',
        },{
            $Type : 'UI.DataField',
            Value : BookingID,
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@UI.Chart#BookedFlights',
            Label : '{i18n>VipStatus}',
        },{
            $Type : 'UI.DataField',
            Value : BookingID,
        },      
        {
            $Type : 'UI.DataField',
            Value : to_Customer_CustomerID,
        },{
            $Type : 'UI.DataField',
            Value : to_Carrier_AirlineID,
        },{
            $Type : 'UI.DataField',
            Value : ConnectionID,
        },{
            $Type : 'UI.DataField',
            Value : FlightDate,
        },{
            $Type : 'UI.DataField',
            Value : FlightPrice,
        },
        {
            $Type : 'UI.DataField',
            Value : BookingStatus_code,
        },]
);
annotate service.Travel with {
    to_Agency @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'TravelAgency',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : to_Agency_AgencyID,
                    ValueListProperty : 'AgencyID',
                },
            ],
        },
        Common.ValueListWithFixedValues : false
)};

annotate service.Booking with @(
    UI.DataPoint #BookedFlights : {
        Value : BookedFlights,
        TargetValue : to_Carrier.VIPCustomerBookings,
        Criticality : EligibleForPrime
    },
    UI.Chart #BookedFlights : {
        ChartType : #Donut,
        Measures : [
            BookedFlights,
        ],
        MeasureAttributes : [
            {
                DataPoint : '@UI.DataPoint#BookedFlights',
                Role : #Axis1,
                Measure : BookedFlights,
            },
        ],
    }
);
annotate service.BookedFlights with @(
    UI.Chart #BookedFlights : {
        $Type : 'UI.ChartDefinitionType',
        ChartType : #Column,
        Dimensions : [
            to_Customer_CustomerID, AirlineID
        ],
        DimensionAttributes : [
            {
                $Type : 'UI.ChartDimensionAttributeType',
                Dimension : to_Customer_CustomerID,
                Role : #Category,
            },
            {
                $Type     : 'UI.ChartDimensionAttributeType',
                Dimension : AirlineID,
                Role      : #Series
            }            
        ],
        Measures : [
            CountFlights,
        ],
        MeasureAttributes : [
            {
                $Type : 'UI.ChartMeasureAttributeType',
                Measure : CountFlights,
                Role : #Axis1,
            },
        ],
    }
);
annotate service.Travel with @(
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'TravelService.acceptTravel',
            Label : '{i18n>AcceptTravel}',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'TravelService.rejectTravel',
            Label : 'Reject Travel',
        },
    ]
);
