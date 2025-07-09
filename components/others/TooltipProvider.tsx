import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "components/ui/tooltip"

type TooltipAttributes = {
    name: string,
    children: React.ReactNode
}

const TooltipProvider = ({ name, children }: TooltipAttributes) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                <p>{name}</p>
            </TooltipContent>
        </Tooltip>
    )
}

export default TooltipProvider