import { ComponentProps } from "react";
import { withForm } from "./withFormHook";
import { Textarea } from "@/components/ui/textarea";

type TextAreaProps = ComponentProps<"textarea">;

export const FormTextArea = withForm<string, TextAreaProps>(Textarea)