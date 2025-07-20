import { ComponentProps } from "react";
import { withForm } from "./withFormHook";
import { Input } from "@/components/ui/input";

type InputProps = ComponentProps<"input">;

export const FormInput = withForm<string, InputProps>(Input)