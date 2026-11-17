const BASE_URL = 'http://localhost:8080/stock'
export function StockService(){


       async function fetchStockItems() {
             const response = await fetch(`${BASE_URL}`,{method: 'GET' ,headers: { 'Accept': 'application/json' }} )
            let body = await response.json()
             
            if(!response.ok){
                const err = new Error(body?.error ?? `Request failed with status ${response.status})`)
                err.status = response.status
                err.errors = body?.errors ?? {}
                throw err
            }
            return body
        

    }

    async function fetchStockItemHistory(id) {

            const response = await fetch(`${BASE_URL}/history/${id}`,{method: 'GET' ,headers: { 'Accept': 'application/json' }} )
            let body = await response.json()
             
            if(!response.ok){
                const err = new Error(body?.error ?? `Request failed with status ${response.status})`)
                err.status = response.status
                err.errors = body?.errors ?? {}
                throw err
            }
            return body


    }

    async function addStockItem(payload) {
            
            const response = await fetch(`${BASE_URL}/add-stock`,{method: 'POST', body: JSON.stringify(payload),headers: []} )
            const body = await response.json()
             
            if(!response.ok){
                const err = new Error(body?.error ?? `Request failed with status ${response.status})`)
                err.status = response.status
                err.errors = body?.errors ?? {}
                throw err
            }
            return body  

    } 

    async function updateStockItem(payload, id){
            const response = await fetch(`${BASE_URL}/update-title/${id}`,{method: 'PUT',body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' }})
            const body = await response.json()
            if (!response.ok){

                const err = new Error(body?.error ?? `Request failed with status ${response.status})`)
                err.status = response.status
                err.errors = body?.errors ?? {}
                throw err

            }
            return body;
    }

    async function deleteStockItem(id) {

        const response = await fetch(`${BASE_URL}/${id}`, {method: "DELETE", headers: { 'Content-Type': 'application/json' }})
        const body = await response.json()

        if(!response.ok){
               const err = new Error(body?.error ?? `Request failed with status ${response.status})`)
                err.status = response.status
                err.errors = body?.errors ?? {}
                throw err
        }

        return body;

    }

    async function adjustStockLevels(payload,id) {
            const response = await fetch(`${BASE_URL}/adjust-stock/${id}`,{method: 'PUT',body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' }})
            const body = await response.json()
            if (!response.ok){

                const err = new Error(body?.error ?? `Request failed with status ${response.status})`)
                err.status = response.status
                err.errors = body?.errors ?? {}
                throw err

            }
            return body;
        
    }

    return { fetchStockItems, fetchStockItemHistory, deleteStockItem, updateStockItem, addStockItem, adjustStockLevels}
}