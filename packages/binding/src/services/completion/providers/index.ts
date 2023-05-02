import { CompletionItem } from "vscode-languageserver-types";
import { AttributeValueCompletion } from "@xml-tools/content-assist";
import { propertyBindingInfoSuggestions } from "./property-binding-info";
import { BindContext } from "../../../types";

export const attributeValueProviders: AttributeValueCompletion<
  CompletionItem,
  BindContext
>[] = [propertyBindingInfoSuggestions];
