import { Client } from "@/lib/client";
import { detectionService } from "./detection";

export const privateServices: Client[] = [
    detectionService
]

// FIXME: not used
export const serviceUtils = {
    loginServices : (token: string) => {
        privateServices.forEach(service => {
            service.setApiAuthToken(token)
        })
    },
    logoutServices : () => {
        privateServices.forEach(service => {
            service.clearApiAuthToken()
        })
    },
    hasAuthToken : () => {
        return privateServices.every(service => service.hasAuthToken())
    }
}