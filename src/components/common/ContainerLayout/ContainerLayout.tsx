import { cn } from "@/lib/utils"
import { PropsWithChildren } from "react";


interface Props extends PropsWithChildren {
    className?: string;
}

export const ContainerLayout = ({ children, className }: Props) => {
    return (
        <div className={cn("mx-auto px-4 lg:px-6 xl:px-8 max-w-full w-full", className)}>
            {children}
        </div>
    )
}