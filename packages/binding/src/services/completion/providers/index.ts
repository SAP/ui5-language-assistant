import { CompletionItem } from "vscode-languageserver-types";
import { AttributeValueCompletion } from "@xml-tools/content-assist";
import { bindingSuggestions } from "./binding";
import { BindContext } from "../../../types";

export const attributeValueProviders: AttributeValueCompletion<
  CompletionItem,
  BindContext
>[] = [bindingSuggestions];
