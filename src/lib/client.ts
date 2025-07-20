
import { API_BASE_URL } from "@/constants/envs"

type Headers = Record<string, string>

// Custom fetch client
export class Client {
    baseUrl: string = API_BASE_URL
    headers: Headers = {
        'Content-Type': 'application/json', // Default content type to json
    }
    privateHeaders: Headers = {
        ...this.headers,
        credential: "include", // Include credentials in requests
    }

    token = ""

    public setApiAuthToken(token: string) {
        this.token = token
        this.privateHeaders = {
            ...this.privateHeaders,
            Authorization: `Bearer ${this.token}`, // Set the Authorization header with the token
        }
    }

    public clearApiAuthToken() {
        this.privateHeaders = {
            ...this.headers, // Reset to default headers
        }
        this.token = "" // Clear the token
    }

    public hasAuthToken(): boolean {
        return Boolean(this.token)
    }

    public getFormDataHeaders(): Headers {
        const cloned = { ...this.privateHeaders }
        delete cloned['Content-Type'] // Remove Content-Type for form data
        return cloned
    }

}
