const API_VERSION = "v0"

export const SERVER_URL = 'http://localhost:8080/'

export const DEPOSIT_API = `api/${API_VERSION}/deposit`
export const CREATE_DEPOSIT = `${SERVER_URL}${DEPOSIT_API}`
export const GET_DEPOSITS = `${SERVER_URL}${DEPOSIT_API}`
export const WITHDRAW_DEPOSIT = `${SERVER_URL}${DEPOSIT_API}/withdraw`
export const ADD_TO_DEPOSIT = `${SERVER_URL}${DEPOSIT_API}/add-money`
export const TRANSFER = `${SERVER_URL}${DEPOSIT_API}/transfer`


export const EXPORT_API = `api/${API_VERSION}/export`
export const DEPOSIT_EXPORT = `${SERVER_URL}${EXPORT_API}/deposit`
export const EXPORT_XLSX = `xlsx`