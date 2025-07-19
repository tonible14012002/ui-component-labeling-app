import { Client } from "@/lib/client";

export const privateServices: Client[] = [

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