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

const TooltipComponent = ({ name, children }: TooltipAttributes) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                <h4 className='text-white bg-black p-2 rounded'>{name}</h4>
            </TooltipContent>
        </Tooltip>
    )
}

export default TooltipComponent