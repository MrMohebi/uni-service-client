import React from "react";
import {makeVar} from "@apollo/client";

export const Messages = makeVar([] as any[])
export const CurrentChatUserData = makeVar({} as {
    id: string
    members: [
        any
    ]
})
