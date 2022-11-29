type UserFacingAttributes = {
  [key: string]: Array<string>;
};
export function getUserFacingAttributes(): UserFacingAttributes {
  const uiTextProperties = {
    "sap.suite.ui.commons.AriaProperties": [
      "label", //Defines a string value that labels the current element. See the related labelledBy property.
    ],
    "sap.suite.ui.commons.BusinessCard": [
      "imageTooltip", //A tooltip that is set for an image.
      "secondTitle", //A short text line that describes this BusinessCard.
    ],
    "sap.suite.ui.commons.CalculationBuilder": [
      "expression", //Holds the arithmetic expression. Use either this property or aggregation Items . Not both.
      "title", //The title of the calculation builder element.
    ],
    "sap.suite.ui.commons.CalculationBuilderFunction": [
      "description", //Description of the function. The description is displayed in the functions menu on the calculation builder's toolbar. If no description is specified, it is generated automatically based on the key property and the parameters defined in the items aggregation.
      "label", //Label for the function. The label is displayed in the visual editor of the calculation builder and in the functions menu on the calculation builder's toolbar.
    ],
    "sap.suite.ui.commons.CalculationBuilderGroup": [
      "description", //Additional description for the variable group.
      "title", //Label for the group. The label is displayed in the visual editor of the calculation builder and in the variables menu on the calculation builder's toolbar.
    ],
    "sap.suite.ui.commons.CalculationBuilderVariable": [
      "label", //Label for the variable. The label is displayed in the visual editor of the calculation builder and in the variables menu on the calculation builder's toolbar.
    ],
    "sap.suite.ui.commons.ChartContainer": [
      "selectorGroupLabel", //Custom Label for Selectors Group.
      "title", //String shown if there are no dimensions to display.
    ],
    "sap.suite.ui.commons.ChartContainerContent": [
      "title", //Title of the Chart/Table
    ],
    "sap.suite.ui.commons.ChartTile": [
      "unit", //The percent sign, the currency symbol, or the unit of measure.
    ],
    "sap.suite.ui.commons.FacetOverview": [
      "title", //This property is shown in the upper left part of control.
    ],
    "sap.suite.ui.commons.FeedItem": [
      "title", //The title of the feed item.
    ],
    "sap.suite.ui.commons.FeedItemHeader": [
      "description", //The description of the feed item.
      "title", //The title of the feed item.
    ],
    "sap.suite.ui.commons.GenericTile2X2": [
      "failedText", //The message that appears when the control is in the Failed state.
      "header", //The header of the tile.
      "imageDescription", //Description of a header image that is used in the tooltip.
      "subheader", //The subheader of the tile.
    ],
    "sap.suite.ui.commons.imageeditor.CustomSizeItem": [
      "label", //Defines the label of the CustomSizeItem .
    ],
    "sap.suite.ui.commons.InfoTile": [
      "description", //Shows the description of the selected tile.
      "footer", //The footer text of the tile.
      "title", //The title of the tile.
    ],
    "sap.suite.ui.commons.KpiTile": [
      "description", //The Description field.
      "value", //The Value field.
      "valueScale", //The scale of a value.
      "valueUnit", //The percent sign, currency symbol, or unit for a value.
    ],
    "sap.suite.ui.commons.LaunchTile": [
      "title", //Descriptive title of the launch destination.
    ],
    "sap.suite.ui.commons.MicroProcessFlow": [
      "ariaLabel", //ARIA label for this control to be used by screen reader software.
    ],
    "sap.suite.ui.commons.MicroProcessFlowItem": [
      "title", //Title associated with this node. The title is displayed as a tooltip when the user hovers over the node. This title can also be used by screen reader software.
    ],
    "sap.suite.ui.commons.MonitoringContent": [
      "value", //The actual value.
    ],
    "sap.suite.ui.commons.MonitoringTile": [
      "value", //The actual value.
    ],
    "sap.suite.ui.commons.networkgraph.ActionButton": [
      "title", //Tooltip title for custom action button.
    ],
    "sap.suite.ui.commons.networkgraph.ElementAttribute": [
      "label", //Label of the attribute. If set to null, the label is not displayed.
    ],
    "sap.suite.ui.commons.networkgraph.ElementBase": [
      "description", //Description.
      "title", //A title associated with the element.
    ],
    "sap.suite.ui.commons.networkgraph.Graph": [
      "noDataText", //Text displayed when no data is set. This property takes effect only when the noData property is set to true .
    ],
    "sap.suite.ui.commons.networkgraph.GraphMap": [
      "title", //Graph overview title
    ],
    "sap.suite.ui.commons.networkgraph.Status": [
      "title", //Title of the node. The title that is applied to elements that are in this custom status. The title is displayed in the legend.
    ],
    "sap.suite.ui.commons.NoteTaker": [
      "attachmentName", //The attachment property name for identification on the server side after sending data to the server.
    ],
    "sap.suite.ui.commons.NoteTakerCard": [
      "attachmentFilename", //Stores the name of the file attached to the card.
      "body", //Stores the Note Taker card body text.
      "header", //Stores the Note Taker card header.
    ],
    "sap.suite.ui.commons.NoteTakerFeeder": [
      "attachmentName", //The attachment property name for identification on the server side after sending data to the server.
      "body", //The text inside the note card.
      "title", //This text is the header of a new note.
    ],
    "sap.suite.ui.commons.NumericTile": [
      "unit", //The percent sign, the currency symbol, or the unit of measure.
    ],
    "sap.suite.ui.commons.PictureZoomIn": [
      "description", //Description is shown under image.
    ],
    "sap.suite.ui.commons.ProcessFlowLaneHeader": [
      "text", //Text information that is displayed in the control.
    ],
    "sap.suite.ui.commons.ProcessFlowNode": [
      "stateText", //Description of the state, for example \"Status OK\".
      "texts", //The property contains the additional texts on the node. The expected type is array of strings. One array must not contain more than two strings. Additional strings in the array will be ignored.
      "title", //The node title.
      "titleAbbreviation", //Title abbreviation is used in zoom level 'Three'.
    ],
    "sap.suite.ui.commons.RepeaterViewConfiguration": [
      "title", //The title of the view to be displayed in sap.suite.ui.commons.ViewRepeater view selector. If neither this nor \"icon\"property are defined, the default title \"View ##\"will be shown, where ## is an index number of the view in View Repeater starting from 1.
    ],
    "sap.suite.ui.commons.SplitButton": [
      "text", //Text to be displayed for the action button.
    ],
    "sap.suite.ui.commons.statusindicator.DiscreteThreshold": [
      "ariaLabel", //ARIA label for this threshold to be used by screen reader software.
    ],
    "sap.suite.ui.commons.statusindicator.PropertyThreshold": [
      "ariaLabel", //ARIA label for this threshold to be used by screen reader software.
    ],
    "sap.suite.ui.commons.statusindicator.StatusIndicator": [
      "ariaLabel", //ARIA label for this control to be used by screen reader software.
    ],
    "sap.suite.ui.commons.taccount.TAccount": [
      "measureOfUnit", //Unit of measurement. Can be set to a currency or any other applicable unit of measurement. Please note that if multi-currency accounts are used, the T account control will not convert the values to the currency defined in this property.
      "subtitle", //Subtitle of the T account.
      "title", //Title of the T account.
    ],
    "sap.suite.ui.commons.taccount.TAccountGroup": [
      "title", //Title of the group.
    ],
    "sap.suite.ui.commons.taccount.TAccountItem": [
      "ariaLabel", //Aria label for item.
    ],
    "sap.suite.ui.commons.taccount.TAccountItemProperty": [
      "label", //Label of the property. Can be hidden or displayed using the displayLabel property.
      "value", //Value of the property.
    ],
    "sap.suite.ui.commons.taccount.TAccountPanel": [
      "title", //Title of the panel.
    ],
    "sap.suite.ui.commons.TargetFilterColumn": [
      "title", //The column title.
    ],
    "sap.suite.ui.commons.TileContent2X2": [
      "footer", //The footer text of the tile.
      "unit", //The percent sign, the currency symbol, or the unit of measure.
    ],
    "sap.suite.ui.commons.Timeline": [
      "filterTitle", //Title for the data filter. When a filter is applied, this title is displayed in the message strip along with the filter name.
      "noDataText", //This text is displayed when the control has no data. The default value is loaded from the component resource bundle.
    ],
    "sap.suite.ui.commons.TimelineFilterListItem": [
      "text", //A textual label for the filter criterion. This text is displayed in the filter criteria list in the UI.
    ],
    "sap.suite.ui.commons.TimelineItem": [
      "filterValue", //Text for the items filter name. This text will be used as the name of the items filter in the filter popover.
      "iconInitials", //Defines the initials of the icon. Since: 1.88.
      "iconTooltip", //Tooltip for an icon displayed on the timeline axis.
      "text", //Text shown inside the timeline post.
      "title", //Text shown in the post title right after the user name.
      "userName", //User name shown in the post title.
    ],
    "sap.suite.ui.commons.UnifiedThingGroup": [
      "description", //The description of the group.
      "title", //The title of the group.
    ],
    "sap.suite.ui.commons.UnifiedThingInspector": [
      "description", //The description of the thing.
      "name", //The name of the thing.
      "title", //The title of the thing.
    ],
    "sap.chart.data.Dimension": [
      "displayText", //Whether a text is displayed. If the \"textProperty\"property has not been specified, it will be derived from the metadata.
      "label", //Label for the Dimension, either as a string literal or by a pointer using the binding syntax to some property containing the label. NOTE: This property was bound internally if automatically created via metadata of oData service and please call \"unbindProperty\"before setting.
      "role", //How the Dimension will influence the chart layout. Possible values are category , series or category2 . The default is category . You can create a new dimension as follow: \n...\nnew sap.chart.data.Dimension(name: \"DIMENSION1\", role: sap.chart.data.DimensionRoleType.category)\n...\n Detailed usage of dimension role. Please refer to DimensionRoleType NOTE: Has no effect if the Dimension is used as inResultDimensions by Chart
    ],
    "sap.chart.data.Measure": [
      "label", //Label for the Measure, either as a string literal or by a pointer using the binding syntax to some property containing the label.
    ],
    "sap.collaboration.components.socialtimeline.Component": [
      "noDataText", //
    ],
    "sap.f.AvatarGroupItem": [
      "initials", //Defines the displayed initials.
    ],
    "sap.f.cards.Header": [
      "iconAlt", //Defines an alt text for the avatar or icon.
      "iconInitials", //Defines the initials of the icon.
      "statusText", //Defines the status text.
      "subtitle", //Defines the subtitle.
      "title", //Defines the title.
    ],
    "sap.f.cards.NumericHeader": [
      "details", //Additional text which adds more details to what is shown in the numeric header.
      "statusText", //Defines the status text.
      "subtitle", //The subtitle of the card
      "title", //The title of the card
      "unitOfMeasurement", //General unit of measurement for the header. Displayed as side information to the subtitle.
    ],
    "sap.f.cards.NumericSideIndicator": [
      "title", //The title of the indicator
      "unit", //Defines the unit of measurement (scaling prefix) for the numeric value
    ],
    "sap.f.DynamicPageAccessibleLandmarkInfo": [
      "contentLabel", //Texts which describe the landmark of the content container of the corresponding sap.f.DynamicPage control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
      "footerLabel", //Texts which describe the landmark of the header container of the corresponding sap.f.DynamicPage control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
      "headerLabel", //Texts which describe the landmark of the header container of the corresponding sap.f.DynamicPage control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
      "rootLabel", //Texts which describe the landmark of the root container of the corresponding sap.f.DynamicPage control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
    ],
    "sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo": [
      "firstColumnLabel", //Text that describes the landmark of the first column of the corresponding sap.f.FlexibleColumnLayout control. If not set, a predefined text is used.
      "lastColumnLabel", //Text that describes the landmark of the last column of the corresponding sap.f.FlexibleColumnLayout control. If not set, a predefined text is used.
      "middleColumnLabel", //Text that describes the landmark of the middle column of the corresponding sap.f.FlexibleColumnLayout control. If not set, a predefined text is used.
    ],
    "sap.f.ProductSwitchItem": [
      "title", //Determines the title of the ProductSwitchItem .
    ],
    "sap.f.SearchManager": [
      "placeholder", //Defines the text that is displayed when no value is available. The default placeholder text is the word \"Search\"in the current local language (if supported) or in English.
    ],
    "sap.f.semantic.MainAction": [
      "text", //Defines MainAction text
    ],
    "sap.f.semantic.NegativeAction": [
      "text", //Defines NegativeAction text. Note: the default text is \"Reject\"
    ],
    "sap.f.semantic.PositiveAction": [
      "text", //Defines PositiveAction text. Note: the default text is \"Accept\"
    ],
    "sap.f.ShellBar": [
      "homeIconTooltip", //Defines a custom tooltip for the home icon. If not set, a default tooltip is used. Since: 1.67.
      "secondTitle", //Defines the secondary title of the control.
      "title", //Defines the main title of the control.
    ],
    "sap.gantt.AdhocLine": [
      "description", //Description of the time stamp
    ],
    "sap.gantt.config.ChartScheme": [
      "name", //Description of the Chart scheme
    ],
    "sap.gantt.config.ContainerLayout": [
      "text", //
    ],
    "sap.gantt.config.Hierarchy": [
      "text", //Description of the hierarchy
    ],
    "sap.gantt.config.HierarchyColumn": [
      "title", //Title is used as the title of the column header in the tree table
    ],
    "sap.gantt.config.Mode": [
      "text", //Description of the mode
    ],
    "sap.gantt.config.ObjectType": [
      "description", //Description of the object type
    ],
    "sap.gantt.config.SettingItem": [
      "displayText", //Aria label of the checkbox
    ],
    "sap.gantt.config.ToolbarScheme": [
      "legend", //Toolbar group for legend We recommend that you set the type of this argument to sap.gantt.config.ToolbarGroup . Otherwise some properties you set may not function properly.
    ],
    "sap.gantt.shape.Definitions": [
      "content", //Definition string. Subclasses can implement their own getters of this property to override the one in this class.
    ],
    "sap.gantt.shape.ext.rls.Relationship": [
      "category", //Category name
    ],
    "sap.gantt.shape.ext.TextRepeat": [
      "text", //
    ],
    "sap.gantt.shape.Shape": [
      "ariaLabel", //
      "category", //
      "legend", //
      "title", //
    ],
    "sap.gantt.shape.Text": [
      "text", //
    ],
    "sap.gantt.simple.AdhocLine": [
      "description", //Description of the time stamp
    ],
    "sap.gantt.simple.BaseChevron": [
      "title", //The title of the Chevron.
    ],
    "sap.gantt.simple.BaseDeltaRectangle": [
      "title", //Title of the rectangle.
    ],
    "sap.gantt.simple.BaseShape": [
      "title", //The title of the Shape.
    ],
    "sap.gantt.simple.BaseText": [
      "text", //Text content
    ],
    "sap.gantt.simple.DeltaLine": [
      "description", //Description of the Delta Line
    ],
    "sap.gantt.simple.DimensionLegend": [
      "title", //Title of Legend Page & text of navigation list item (if not set it will be empty)
    ],
    "sap.gantt.simple.GanttChartContainer": [
      "statusMessage", //Defines the message texts set on the status bar. Since: 1.88.
    ],
    "sap.gantt.simple.LegendColumnConfig": [
      "text", //
    ],
    "sap.gantt.simple.LegendRowConfig": [
      "shapeName", //Specifies the name of the dimension legend row
      "text", //The text content
    ],
    "sap.gantt.simple.LegendShapeGroup": [
      "title", //The title for multiple shapes rendering
    ],
    "sap.gantt.simple.ListLegend": [
      "title", //Title of Legend. The title is displayed on both the legend page and the legend navigation list. Null if not specified
    ],
    "sap.gantt.simple.shapes.Task": [
      "title", //Title used for legend.
    ],
    "sap.gantt.simple.StockChartDimension": [
      "name", //The name of the Dimension
    ],
    "sap.gantt.simple.UtilizationDimension": [
      "name", //The name of the utilization dimension, e.g. Total Weight
    ],
    "sap.landvisz.ConnectionEntity": [
      "dependencyTooltip", //tooltip for dependency type icon
      "linkedHeader", //link header data that is shared with in the entities
    ],
    "sap.landvisz.internal.ActionBar": [
      "actionLabel", //label for action
      "actionTooltip", //Tooltip for the action
    ],
    "sap.landvisz.internal.DataContainer": [
      "header", //Text of Navigation Header
    ],
    "sap.landvisz.internal.EntityAction": [
      "actionTooltip", //Tooltip for the internal action
    ],
    "sap.landvisz.internal.HeaderList": [
      "headerTooltip", //ToolTip for headers
    ],
    "sap.landvisz.internal.IdentificationBar": [
      "description", //despriction of the identification region of a control
      "qualifierText", //text that identifies the server
      "qualifierTooltip", //tooltip to identify the server
      "text", //text that identifies a system
    ],
    "sap.landvisz.internal.LinearRowField": [
      "iconTitle", //title of the icon displayed in the row field
      "label", //text to be displayed in the row field
      "rightIconTooltip", //tool tip for the right icon
    ],
    "sap.landvisz.internal.ModelingStatus": [
      "stateIconTooltip", //tooltip for the icon
      "statusTooltip", //Tooltip for status that determines the state of the system namely correct, warning, error
    ],
    "sap.landvisz.internal.NestedRowField": [
      "iconTitle", //titlte of the icon rendered in the nested row field
      "label", //label for data in a row field
    ],
    "sap.landvisz.internal.SingleDataContainer": [
      "header", //header of the tab
    ],
    "sap.landvisz.LandscapeEntity": [
      "componentTypeTooltip", //Tooltip for component type
      "description", //description of the identification region
      "qualifierText", //text of qualifier icon
      "qualifierTooltip", //tooltip for qualifier icon
      "stateIconTooltip", //tooltip of modelling status icon
      "statusTooltip", //tooltip for modelling status
      "systemName", //name of the system
    ],
    "sap.landvisz.LandscapeViewer": [
      "boxDependencyLabel", //Label of box view
      "closeButtonTooltip", //tooltip for close button
      "componentViewLabel", //Label for the component view
      "componentViewTooltip", //tooltip for component view button
      "deploymentOptionsLabel", //Label for the options
      "deploymentOptionsTooltip", //tooltip of label for the options
      "deploymentViewLabel", //Label for deployment view.
      "deploymentViewTooltip", //tooltip for deployment view button
      "networkDependencyLabel", //Label of the network view
      "title", //Header of the rendered view
    ],
    "sap.landvisz.LongTextField": [
      "text", //Long text for a header
    ],
    "sap.landvisz.OptionEntity": [
      "label", //label for option entity
      "optionTextTooltip", //tooltip for options
    ],
    "sap.m.ActionListItem": [
      "text", //Defines the text that appears in the control.
    ],
    "sap.m.ActionSheet": [
      "cancelButtonText", //This is the text displayed in the cancelButton. Default value is \"Cancel\", and it's translated according to the current locale setting. This property will be ignored when running either in iPad or showCancelButton is set to false.
      "title", //Title will be shown in the header area in iPhone and every Android devices. This property will be ignored in tablets and desktop browser.
    ],
    "sap.m.Avatar": [
      "badgeTooltip", //Defines a custom tooltip for the badgeIcon . If set, it overrides the available default values. If not set, default tooltips are used as follows: Specific default tooltips are displayed for each of the predefined badgeIcons . For any other icons, the displayed tooltip is the same as the main control tooltip. Since: 1.77.
      "initials", //Defines the displayed initials.
    ],
    "sap.m.Breadcrumbs": [
      "currentLocationText", //Determines the text of current/last element in the Breadcrumbs path. Since: 1.34.
    ],
    "sap.m.BusyDialog": [
      "cancelButtonText", //The text of the cancel button. The default text is \"Cancel\"(translated to the respective language).
      "text", //Optional text displayed inside the dialog.
      "title", //Sets the title of the BusyDialog. The default value is an empty string.
    ],
    "sap.m.BusyIndicator": [
      "text", //Defines text to be displayed below the busy indicator. It can be used to inform the user of the current operation.
    ],
    "sap.m.Button": [
      "text", //Determines the text of the Button .
    ],
    "sap.m.CheckBox": [
      "text", //Defines the text displayed next to the checkbox
      "valueStateText", //Defines the text that appears in the tooltip of the CheckBox . If this is not specified, a default text is shown from the resource bundle. Since: 1.74.
    ],
    "sap.m.CustomListItem": [
      "accDescription", //Defines the custom accessibility announcement. Note: If defined, then only the provided custom accessibility description is announced when there is a focus on the list item. Since: 1.84.
    ],
    "sap.m.DateTimeInput": [
      "placeholder", //Defines a short hint intended to aid the user with data entry when the control has no value.
      "valueStateText", //Defines the text that appears in the value state message pop-up. If this is not specified, a default text is shown from the resource bundle. Since: 1.26.0.
    ],
    "sap.m.Dialog": [
      "title", //Title text appears in the Dialog header.
    ],
    "sap.m.DisplayListItem": [
      "label", //Defines the label of the list item.
      "value", //Defines the value of the list item.
    ],
    "sap.m.DynamicDateRange": [
      "placeholder", //Defines a short hint intended to aid the user with data entry when the control has no value. Since: 1.92.
      "valueStateText", //Defines the text that appears in the value state message popup. Since: 1.92.
    ],
    "sap.m.DynamicDateValueHelpUIType": [
      "additionalText", //A text for an additional label that describes the interactive UI and is placed after the UI element.
      "text", //A text for an additional label that describes the interactive UI and is placed before the UI element.
    ],
    "sap.m.ExpandableText": [
      "text", //Determines the text to be displayed.
    ],
    "sap.m.FacetFilterItem": [
      "text", //Determines the text to be displayed for the item.
    ],
    "sap.m.FacetFilterList": [
      "title", //Defines the title of the facet. The facet title is displayed on the facet button when the FacetFilter type is set to Simple . It is also displayed as a list item in the facet page of the dialog.
    ],
    "sap.m.FeedContent": [
      "contentText", //The content text.
      "subheader", //The subheader.
    ],
    "sap.m.FeedInput": [
      "ariaLabelForPicture", //Text for Picture which will be read by screenreader. If a new ariaLabelForPicture is set, any previously set ariaLabelForPicture is deactivated. Deprecated as of version 1.88. This will not have any effect in code now.
      "iconInitials", //Defines the initials of the icon. Since: 1.88.
      "placeholder", //The placeholder text shown in the input area as long as the user has not entered any text value.
    ],
    "sap.m.FeedListItem": [
      "iconInitials", //Defines the initials of the icon. Since: 1.88.
      "info", //The Info text.
      "lessLabel", //Customizable text for the \"LESS\"link at the end of the feed list item. Clicking the \"LESS\"link collapses the item, hiding the text that exceeds the allowed maximum number of characters. Since: 1.60.
      "moreLabel", //Customizable text for the \"MORE\"link at the end of the feed list item. When the maximum number of characters defined by the maxCharacters property is exceeded and the text of the feed list item is collapsed, the \"MORE\"link can be used to expand the feed list item and show the rest of the text. Since: 1.60.
      "sender", //Sender of the chunk
      "text", //The FeedListItem text. It supports html formatted tags as described in the documentation of sap.m.FormattedText
    ],
    "sap.m.FeedListItemAction": [
      "text", //The text of the item. It is used as a tooltip and for accessibility reasons.
    ],
    "sap.m.FormattedText": [
      "htmlText", //Text in HTML format. The following tags are supported: a abbr bdi blockquote br cite code em h1 h2 h3 h4 h5 h6 p pre strong span u dl dt dd ul ol li class, style, dir, and target attributes are allowed. If target is not set, links open in a new window by default. Only safe href attributes can be used. See URLListValidator . Note: Keep in mind that not supported HTML tags and the content nested inside them are both not rendered by the control.
    ],
    "sap.m.GenericTag": [
      "text", //Defines the text rendered by the control. It's a value-descriptive text rendered on one line.
    ],
    "sap.m.GenericTile": [
      "additionalTooltip", //Tooltip text which is added at the tooltip generated by the control. Since: 1.82.
      "ariaLabel", //Additional description for aria-label. The aria-label is rendered before the standard aria-label. Since: 1.50.0.
      "ariaRoleDescription", //Additional description for aria-roledescription. Since: 1.83.
      "failedText", //The message that appears when the control is in the Failed state.
      "header", //The header of the tile.
      "imageDescription", //Description of a header image that is used in the tooltip.
      "navigationButtonText", //Text for navigate action button. Default Value is \"Read More\". Works only in ArticleMode.
      "subheader", //The subheader of the tile.
      "systemInfo", //Backend system context information Since: 1.92.0.
    ],
    "sap.m.GroupHeaderListItem": [
      "title", //Defines the title of the group header.
    ],
    "sap.m.GrowingList": [
      "triggerText", //Text which is displayed on the trigger at the end of the list. The default is a translated text (\"Load More Data\") coming from the messagebundle properties. This property can be used only if growing property is set \"true\"and scrollToLoad property is set \"false\". Since: 1.16.
    ],
    "sap.m.IllustratedMessage": [
      "description", //Defines the description displayed below the title. If there is no initial input from the app developer and the default illustration set is being used, a default description for the current illustration type is going to be displayed. The default description is stored in the sap.m resource bundle. Since: 1.98.
      "title", //Defines the title that is displayed below the illustration. If there is no initial input from the app developer and the default illustration set is being used, a default title is displayed corresponding to the current illustrationType . Since: 1.98.
    ],
    "sap.m.Image": [
      "alt", //The alternative text that is displayed in case the image is not available, or cannot be displayed. If the image is set to decorative, this property is ignored.
    ],
    "sap.m.ImageContent": [
      "description", //Description of image. This text is used to provide ScreenReader information.
    ],
    "sap.m.Input": [
      "description", //The description is a text after the input field, e.g. units of measurement, currencies.
    ],
    "sap.m.InputListItem": [
      "label", //Label of the list item
    ],
    "sap.m.Label": [
      "text", //Determines the Label text to be displayed.
    ],
    "sap.m.LightBoxItem": [
      "alt", //Alt value for the image.
      "subtitle", //Subtitle text for the image.
      "title", //Title text for the image. This property is mandatory.
    ],
    "sap.m.Link": [
      "text", //Defines the displayed link text.
    ],
    "sap.m.ListBase": [
      "footerText", //Defines the footer text that appears in the control.
      "growingTriggerText", //Defines the text displayed on the growing button. The default is a translated text (\"More\") coming from the message bundle. This property can only be used if the growing property is set to true . Since: 1.16.0.
      "headerText", //Defines the header text that appears in the control. Note: If headerToolbar aggregation is set, then this property is ignored.
      "noDataText", //This text is displayed if the control contains no items. Note: If both a noDataText property and a noData aggregation are provided, the noData aggregation takes priority. If the noData aggregation is undefined or set to null, the noDataText property is used instead.
    ],
    "sap.m.ListItemBase": [
      "highlightText", //Defines the semantics of the highlight property for accessibility purposes. Since: 1.62.
    ],
    "sap.m.Menu": [
      "title", //Defines the Menu title.
    ],
    "sap.m.MenuButton": [
      "text", //Defines the text of the MenuButton . Note: In Split buttonMode with useDefaultActionOnly set to false , the text is changed to display the last selected item's text, while in Regular buttonMode the text stays unchanged.
    ],
    "sap.m.MessageItem": [
      "description", //Specifies detailed description of the message
      "subtitle", //Specifies the subtitle of the message Note: This is only visible when the title property is not empty.
      "title", //Specifies the title of the message
    ],
    "sap.m.MessagePage": [
      "description", //Determines the detailed description that shows additional information on the MessagePage.
      "iconAlt", //Defines the alt attribute of the icon displayed on the MessagePage . Since: 1.52.
      "text", //Determines the main text displayed on the MessagePage.
      "title", //Determines the title in the header of MessagePage.
    ],
    "sap.m.MessageStrip": [
      "text", //Determines the text of the message.
    ],
    "sap.m.NewsContent": [
      "contentText", //The content text.
      "subheader", //The subheader.
    ],
    "sap.m.NotificationListBase": [
      "authorName", //Determines the notification author name.
      "title", //Determines the title of the NotificationListBase item.
    ],
    "sap.m.NotificationListGroup": [
      "authorName", //Determines the notification group's author name.
    ],
    "sap.m.NotificationListItem": [
      "authorInitials", //Defines the displayed author initials.
      "description", //Determines the description of the NotificationListItem.
    ],
    "sap.m.NumericContent": [
      "iconDescription", //Description of an icon that is used in the tooltip.
    ],
    "sap.m.ObjectAttribute": [
      "text", //Defines the ObjectAttribute text.
      "title", //Defines the ObjectAttribute title.
    ],
    "sap.m.ObjectHeader": [
      "iconAlt", //Determines the alternative text of the ObjectHeader icon. The text is displayed if the image for the icon is not available, or cannot be displayed. Note: Provide an empty string value for the iconAlt property in case you want to use the icon for decoration only.
      "iconTooltip", //Determines the tooltip text of the ObjectHeader icon.
      "intro", //Determines the introductory text for the ObjectHeader .
      "numberUnit", //Determines the units qualifier of the ObjectHeader number. Note: The value of the numberUnit is not displayed if the number property is set to null .
      "title", //Determines the title of the ObjectHeader .
      "titleSelectorTooltip", //Determines a custom text for the tooltip of the select title arrow. If not set, a default text of the tooltip will be displayed. Since: 1.30.0.
    ],
    "sap.m.ObjectIdentifier": [
      "text", //Defines the object text.
      "title", //Defines the object title.
    ],
    "sap.m.ObjectListItem": [
      "intro", //Defines the introductory text for the ObjectListItem.
      "numberUnit", //Defines the number units qualifier of the ObjectListItem.
      "title", //Defines the ObjectListItem title.
    ],
    "sap.m.ObjectMarker": [
      "additionalInfo", //Sets additional information to the displayed type . Note: If no type is set, the additional information will not be displayed.
    ],
    "sap.m.ObjectNumber": [
      "numberUnit", //Defines the number units qualifier.
      "unit", //Defines the number units qualifier. If numberUnit and unit are both set, the unit value is used. Since: 1.16.1.
    ],
    "sap.m.ObjectStatus": [
      "text", //Defines the ObjectStatus text.
      "title", //Defines the ObjectStatus title.
    ],
    "sap.m.p13n.AbstractContainerItem": [
      "text", //Text describing the provided content.
    ],
    "sap.m.p13n.BasePanel": [
      "title", //A short text describing the panel. Note: This text will only be displayed if the panel is being used in a sap.m.p13n.Popup .
    ],
    "sap.m.p13n.Popup": [
      "title", //Text describing the personalization popup.
      "warningText", //Warning text which appears as a message prior to executing the rest callback. Note: The warningText may only be used in case the reset callback has been provided.
    ],
    "sap.m.P13nItem": [
      "description", //Defines additional information of the link. Since: 1.56.0.
      "text", //The text to be displayed for the item.
    ],
    "sap.m.P13nPanel": [
      "title", //Title text appears in the panel.
      "titleLarge", //Large title text appears e.g. in dialog header in case that only one panel is shown. Since: 1.30.0.
    ],
    "sap.m.Page": [
      "navButtonText", //The text of the nav button when running in iOS (if shown) in case it deviates from the default, which is \"Back\". This property is mvi-theme-dependent and will not have any effect in other themes.
      "navButtonTooltip", //The tooltip of the nav button Since version 1.34
      "title", //The title text appearing in the page header bar.
    ],
    "sap.m.PageAccessibleLandmarkInfo": [
      "contentLabel", //Texts that describe the landmark of the content container of the corresponding sap.m.Page control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), a predefined text is used.
      "footerLabel", //Texts that describe the landmark of the footer container of the corresponding sap.m.Page control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), a predefined text is used.
      "headerLabel", //Texts that describe the landmark of the header container of the corresponding sap.m.Page control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), a predefined text is used.
      "rootLabel", //Texts that describe the landmark of the root container of the corresponding sap.m.Page control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), a predefined text is used.
      "subHeaderLabel", //Texts that describe the landmark of the subheader container of the corresponding sap.m.Page control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), a predefined text is used.
    ],
    "sap.m.PagingButton": [
      "nextButtonTooltip", //Determines the tooltip of the next button. Since: 1.36.
      "previousButtonTooltip", //Determines the tooltip of the previous button. Since: 1.36.
    ],
    "sap.m.Panel": [
      "headerText", //This property is used to set the header text of the Panel. The \"headerText\"is visible in both expanded and collapsed state. Note: This property is overwritten by the \"headerToolbar\"aggregation.
    ],
    "sap.m.PDFViewer": [
      "errorMessage", //A custom error message that is displayed when the PDF file cannot be loaded.
      "errorPlaceholderMessage", //A custom text that is displayed instead of the PDF file content when the PDF file cannot be loaded.
      "popupHeaderTitle", //A custom title for the PDF viewer popup dialog. Works only if the PDF viewer is set to open in a popup dialog.
      "title", //A custom title for the PDF viewer.
    ],
    "sap.m.PlanningCalendar": [
      "noDataText", //Defines the text that is displayed when no PlanningCalendarRows are assigned.
    ],
    "sap.m.PlanningCalendarLegend": [
      "appointmentItemsHeader", //Defines the text displayed in the header of the appointment items list. It is commonly related to the calendar appointments.
      "itemsHeader", //Defines the text displayed in the header of the items list. It is commonly related to the calendar days.
    ],
    "sap.m.PlanningCalendarRow": [
      "noAppointmentsText", //Defines the text that is displayed when no CalendarAppointments are assigned.
      "text", //Defines the text of the header (for example, the department of the person).
      "title", //Defines the title of the header (for example, the name of the person).
    ],
    "sap.m.PlanningCalendarView": [
      "description", //Defines the description of the PlanningCalendarView .
    ],
    "sap.m.Popover": [
      "title", //Title text appears in the header. This property will be ignored when showHeader is set to false . If you want to show a header in the sap.m.Popover , don't forget to set the showHeader property to true .
    ],
    "sap.m.ProgressIndicator": [
      "displayValue", //Specifies the text value to be displayed in the bar.
    ],
    "sap.m.PullToRefresh": [
      "description", //Optional description. May be used to inform a user, for example, when the list has been updated last time.
    ],
    "sap.m.QuickViewGroup": [
      "heading", //The title of the group
    ],
    "sap.m.QuickViewGroupElement": [
      "emailSubject", //The subject of the email. Works only with QuickViewGroupElement of type email.
      "label", //Specifies the text displayed below the associated label.
      "value", //Specifies the text of the control that associates with the label.
    ],
    "sap.m.QuickViewPage": [
      "description", //Specifies the text displayed under the header of the content section.
      "header", //Specifies the text displayed in the header of the control.
      "title", //Specifies the text displayed in the header of the content section of the control.
    ],
    "sap.m.RadioButton": [
      "text", //Specifies the text displayed next to the RadioButton
      "valueStateText", //Defines the text that appears in the tooltip of the RadioButton . If this is not specified, a default text is shown from the resource bundle.
    ],
    "sap.m.ResponsivePopover": [
      "title", //This property is supported by both variants. Please see the documentation on sap.m.Popover#title and sap.m.Dialog#title
    ],
    "sap.m.SearchField": [
      "placeholder", //Text shown when no value available. If no placeholder value is set, the word \"Search\"in the current local language (if supported) or in English will be displayed as a placeholder (property value will still be null in that case).
      "refreshButtonTooltip", //Tooltip text of the refresh button. If it is not set, the Default tooltip text is the word \"Refresh\"in the current local language (if supported) or in English. Tooltips are not displayed on touch devices. Since: 1.16.
    ],
    "sap.m.Select": [
      "valueStateText", //Defines the text of the value state message popup. If this is not specified, a default text is shown from the resource bundle. Since: 1.40.5.
    ],
    "sap.m.SelectDialog": [
      "confirmButtonText", //Overwrites the default text for the confirmation button. Since: 1.68.
      "noDataText", //Determines the text shown when the list has no data
      "title", //Determines the title text that appears in the dialog header
    ],
    "sap.m.SelectionDetailsItemLine": [
      "displayValue", //The display value of the line. If this property is set, it overrides the value property and is displayed as is.
      "label", //The label that is shown as the first part of the line. It may contain the name of the currently selected dimension or measure.
      "unit", //The unit of the given value. If this unit is given, the line is displayed bold.
    ],
    "sap.m.semantic.MainAction": [
      "text", //Button text
    ],
    "sap.m.semantic.NegativeAction": [
      "text", //Button text
    ],
    "sap.m.semantic.PositiveAction": [
      "text", //Button text
    ],
    "sap.m.semantic.SemanticPage": [
      "title", //See sap.m.Page#title
    ],
    "sap.m.Shell": [
      "headerRightText", //Defines texts, such as the name of the logged-in user, which should be displayed on the right side of the header (if there is enough space to display the header at all - this only happens on very tall screens (1568px height), otherwise, it is always hidden).
      "title", //Defines the application title, which may or may not be displayed outside the actual application, depending on the available screen size.
    ],
    "sap.m.SinglePlanningCalendar": [
      "title", //Determines the title of the SinglePlanningCalendar .
    ],
    "sap.m.SinglePlanningCalendarView": [
      "title", //Adds a title for the view
    ],
    "sap.m.SplitButton": [
      "text", //Define the text of the button.
    ],
    "sap.m.SplitContainer": [
      "masterButtonText", //Determines the text displayed in master button, which has a default value \"Navigation\". This text is only displayed in iOS platform and the icon from the current page in detail area is displayed in the master button for the other platforms. The master button is shown/hidden depending on the orientation of the device and whether the master area is opened or not. SplitContainer manages the show/hide of the master button by itself only when the pages added to the detail area are sap.m.Page with built-in header or sap.m.Page with built-in header, which is wrapped by one or several sap.ui.core.mvc.View. Otherwise, the show/hide of master button needs to be managed by the application.
      "masterButtonTooltip", //Specifies the tooltip of the master button. If the tooltip is not specified, the title of the page, which is displayed is the master part, is set as tooltip to the master button. Since: 1.48.
    ],
    "sap.m.StandardListItem": [
      "description", //Defines the additional information for the title. Note: This is only visible when the title property is not empty.
      "info", //Defines an additional information text. Note: A wrapping of the information text is also supported as of version 1.95, if wrapping=true . Although long strings are supported for the information text, it is recommended to use short strings. For more details, see wrapping .
      "title", //Defines the title of the list item.
    ],
    "sap.m.StandardTile": [
      "info", //Defines the description of the StandardTile.
      "numberUnit", //Defines the number units qualifier of the StandardTile.
      "title", //Defines the title of the StandardTile.
    ],
    "sap.m.StandardTreeItem": [
      "title", //Defines the title of the item.
    ],
    "sap.m.StepInput": [
      "description", //Determines the description text after the input field, for example units of measurement, currencies. Since: 1.54.
      "placeholder", //Defines a short hint intended to aid the user with data entry when the control has no value. Since: 1.44.15.
      "valueStateText", //Defines the text that appears in the value state message pop-up. Since: 1.52.
    ],
    "sap.m.SuggestionItem": [
      "description", //Additional text of type string, optionally to be displayed along with this item.
    ],
    "sap.m.Switch": [
      "customTextOff", //Custom text for the \"OFF\"state. \"OFF\"translated to the current language is the default value. Beware that the given text will be cut off if available space is exceeded.
      "customTextOn", //Custom text for the \"ON\"state. \"ON\"translated to the current language is the default value. Beware that the given text will be cut off if available space is exceeded.
    ],
    "sap.m.TabContainerItem": [
      "additionalText", //Determines additional text to be displayed for the item.
      "iconTooltip", //Determines the tooltip text of the TabContainerItem 's icon.
      "name", //Determines the text to be displayed for the item.
    ],
    "sap.m.TableSelectDialog": [
      "confirmButtonText", //Overwrites the default text for the confirmation button. Note: This property applies only when the property multiSelect is set to true . Since: 1.68.
      "noDataText", //Specifies the text displayed when the table has no data.
      "title", //Specifies the title text in the dialog header.
    ],
    "sap.m.TileContent": [
      "footer", //The footer text of the tile.
      "priorityText", //Sets the Text inside the Priority badge in Generic Tile ActionMode.
      "unit", //The percent sign, the currency symbol, or the unit of measure.
    ],
    "sap.m.TimePicker": [
      "title", //Displays the text of the general picker label and is read by screen readers. It is visible only on phone.
    ],
    "sap.m.TimePickerSliders": [
      "labelText", //Defines the text of the picker label. It is read by screen readers. It is visible only on phone.
    ],
    "sap.m.Title": [
      "text", //Defines the text that should be displayed as a title. Note: this property is not used if there is a control added to the content aggregation Note: this property will be overridden if there is title element associated and it has text property set.
    ],
    "sap.m.Token": [
      "text", //Displayed text of the token.
    ],
    "sap.m.upload.UploadSet": [
      "noDataDescription", //Defines custom text for the 'No data' description label.
      "noDataText", //Defines custom text for the 'No data' text label.
    ],
    "sap.m.UploadCollection": [
      "noDataDescription", //Allows you to set your own text for the 'No data' description label. Since: 1.46.0.
      "noDataText", //Allows you to set your own text for the 'No data' text label.
      "numberOfAttachmentsText", //Sets the title text in the toolbar of the list of attachments. To show as well the number of attachments in brackets like the default text does. The number of attachments could be retrieved via \"getItems().length\". If a new title is set, the default is deactivated. The default value is set to language-dependent \"Attachments (n)\". Since: 1.30.0.
    ],
    "sap.m.UploadCollectionItem": [
      "ariaLabelForPicture", //Aria label for the icon (or for the image). Since: 1.30.0.
      "contributor", //Specifies the name of the user who uploaded the file.
    ],
    "sap.m.ViewSettingsCustomTab": [
      "title", //Custom tab title
    ],
    "sap.m.ViewSettingsDialog": [
      "title", //Defines the title of the dialog. If not set and there is only one active tab, the dialog uses the default \"View\"or \"Sort\", \"Group\", \"Filter\"respectively.
    ],
    "sap.m.WheelSlider": [
      "label", //Defines the descriptive text for the slider, placed as a label above it.
    ],
    "sap.m.WheelSliderContainer": [
      "labelText", //Defines the text of the picker label.
    ],
    "sap.m.Wizard": [
      "finishButtonText", //Changes the text of the finish button for the last step. This property can be used only if showNextButton is set to true. By default the text of the button is \"Review\".
    ],
    "sap.m.WizardStep": [
      "title", //Determines the title of the step. The title is visualized in the Wizard control.
    ],
    "sap.ndc.BarcodeScannerButton": [
      "dialogTitle", //Defines the bar code input dialog title. If unset, a predefined title will be used.
    ],
    "sap.tnt.InfoLabel": [
      "text", //Specifies the text inside the InfoLabel control.
    ],
    "sap.tnt.SideNavigation": [
      "ariaLabel", //Specifies an optional aria-label that can be used by the screen readers. Since: 1.98.
    ],
    "sap.ui.core.HTML": [
      "content", //HTML content to be displayed, defined as a string. The content is converted to DOM nodes with a call to new jQuery(content) , so any restrictions for the jQuery constructor apply to the content of the HTML control as well. Some of these restrictions (there might be others!) are: the content must be enclosed in tags, pure text is not supported. if the content contains script tags, they will be executed but they will not appear in the resulting DOM tree. When the contained code tries to find the corresponding script tag, it will fail. Please consider to consult the jQuery documentation as well. The HTML control currently doesn't prevent the usage of multiple root nodes in its DOM content (e.g. setContent(\"&lt;div>&lt;/div>&lt;div>&lt;/div>\") ), but this is not a guaranteed feature. The accepted content might be restricted to single root nodes in future versions. To notify applications about this fact, a warning is written in the log when multiple root nodes are used. When changing the content dynamically, ensure that the ID of the root node remains the same as the HTML control's ID. Otherwise it cannot be guaranteed that certain lifecycle events take place.
    ],
    "sap.ui.core.Icon": [
      "alt", //This defines the alternative text which is used for outputting the aria-label attribute on the DOM. Since: 1.30.0.
    ],
    "sap.ui.core.InvisibleText": [
      "text", //The text of the InvisibleText.
    ],
    "sap.ui.core.Item": [
      "text", //The text to be displayed for the item.
    ],
    "sap.ui.core.ListItem": [
      "additionalText", //Some additional text of type string, optionally to be displayed along with this item.
    ],
    "sap.ui.core.Message": [
      "text", //Message text
    ],
    "sap.ui.core.Title": [
      "text", //Defines the title text
    ],
    "sap.ui.core.tmpl.DOMAttribute": [
      "value", //Value of the DOM attribute
    ],
    "sap.ui.core.tmpl.DOMElement": [
      "text", //The text content of the DOM element
    ],
    "sap.ui.core.TooltipBase": [
      "text", //The text that is shown in the tooltip that extends the TooltipBase class, for example in RichTooltip.
    ],
    "sap.ui.core.util.ExportCell": [
      "content", //Cell content.
    ],
    "sap.ui.core.util.ExportColumn": [
      "name", //Column name.
    ],
    "sap.ui.core.util.ExportType": [
      "fileExtension", //File extension.
    ],
    "sap.ui.test.actions.EnterText": [
      "text", //The Text that is going to be typed to the control. If you are entering an empty string, the value will be cleared.
    ],
    "sap.ui.test.matchers.LabelFor": [
      "text", //The text of the sap.m.Label which have the labelFor property.
    ],
    "sap.uiext.inbox.composite.InboxAttachmentsTileContainer": [
      "enteredDescription", //description string entered by user while uploading a file
    ],
    "sap.uiext.inbox.composite.InboxAttachmentTile": [
      "createdBy", //name of the user who has uploaded attachment
      "fileDescription", //description of the attachment
    ],
    "sap.uiext.inbox.composite.InboxComment": [
      "createdBy", //Unique username of the user responsible for adding comment
      "sender", //Sender of the comment chunk
      "text", //The FeedChunk text
    ],
    "sap.uiext.inbox.composite.InboxTaskComments": [
      "feederSender", //Sender for the comment feeder
    ],
    "sap.uiext.inbox.composite.InboxTaskTitleControl": [
      "taskTitle", //The Task Title of the Task
    ],
    "sap.uiext.inbox.InboxLaunchPad": [
      "title", //The title text appearing in Inbox LaunchPad header bar.
      "userName", //User name to be shown in the header.
    ],
    "sap.ushell.ui.appfinder.AppBox": [
      "subtitle", //Specifies the subTitle of the appBox.
      "title", //Specifies the title of the appBox.
    ],
    "sap.ushell.ui.footerbar.AddBookmarkButton": [
      "info", //Text to be displayed at the bottom of the tile.
      "keywords", //The keywords based on which the future tile should be indexed and filtered.
      "numberUnit", //For dynamic tile, the unit to be displayed below the number, for example, USD.
      "subtitle", //Subtitle to be displayed below the tile title.
      "title", //Title to be displayed on the tile.
    ],
    "sap.ushell.ui.launchpad.DashboardGroupsContainer": [
      "accessibilityLabel", //A value for an optional accessibility label.
    ],
    "sap.ushell.ui.launchpad.GridContainer": [
      "headerText", //
    ],
    "sap.ushell.ui.shell.ToolAreaItem": [
      "ariaLabel", //Text which will be read by screenreader. Since: 1.30.
      "text", //
    ],
    "sap.uxap.ObjectPageAccessibleLandmarkInfo": [
      "contentLabel", //Texts which describe the landmark of the content container of the corresponding sap.uxap.ObjectPageLayout control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
      "footerLabel", //Texts which describe the landmark of the header container of the corresponding sap.uxap.ObjectPageLayout control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
      "headerLabel", //Texts which describe the landmark of the header container of the corresponding sap.uxap.ObjectPageLayout control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
      "navigationLabel", //Texts which describe the landmark of the navigation container of the corresponding sap.uxap.ObjectPageLayout control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
      "rootLabel", //Texts which describe the landmark of the root container of the corresponding sap.uxap.ObjectPageLayout control. If not set (and a landmark different than sap.ui.core.AccessibleLandmarkRole.None is defined), no label is set.
    ],
    "sap.uxap.ObjectPageHeader": [
      "objectImageAlt", //The text to be used for the Alt and Tooltip attribute of the image, supplied via the objectImageURI property
      "objectSubtitle", //The description of the object
      "objectTitle", //The title of the object
    ],
    "sap.uxap.ObjectPageSectionBase": [
      "title", //Defines the title of the respective section/subsection. Note: If a subsection is the only one (or the only one visible) within a section, its title is displayed instead of the section title. This behavior is true even if the showTitle propeprty of sap.uxap.ObjectPageSubSection is set to false .
    ],
    "sap.viz.ui5.controls.common.feeds.AnalysisObject": [
      "name", //Name of an analysis object.
    ],
    "sap.viz.ui5.data.DimensionDefinition": [
      "displayValue", //Display value for the dimension. Usually bound to some model field. It doesn't work with 'waterfallType'
      "name", //Name of the dimension as displayed in the chart
      "value", //Value for the dimension. Usually bound to some model field.
    ],
    "sap.viz.ui5.data.MeasureDefinition": [
      "name", //Name of the measure as displayed in the chart
      "unit", //Unit of measure
      "value", //Value for the measure. Usually bound to some model field.
    ],
    "sap.viz.ui5.types.Axis_title": [
      "text", //Set the text of the axis title
    ],
    "sap.viz.ui5.types.legend.Common_title": [
      "text", //Set the text of the legend title
    ],
    "sap.viz.ui5.types.Title": [
      "text", //Set the text of the main title
    ],
  };
  return uiTextProperties;
}
