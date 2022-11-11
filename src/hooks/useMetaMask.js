import React, { useMemo, useState, useEffect, useCallback } from "react";
import { injected } from "../components/wallets/connectors"
import { useWeb3React } from "@web3-react/core";

export const MetaMaskContext = React.createContext(null)

export const MetaMaskProvider = ({ children }) => {

    const { activate, account , library, connector, active, deactivate } = useWeb3React()

    const [isActive, setIsActive] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Init Loading
    useEffect(() => {
        connect().then(val => {
            setIsLoading(false)
        })
    }, [])

    const handleIsActive = useCallback(() => {
        console.log('App is connected with Metamask ', active)
        setIsActive(active)
    }, [active])

    useEffect(() => {
        handleIsActive()
    }, [handleIsActive])


    // Connect to Metamask
    const connect = async () => {
        console.log("Connection to MetaMask")
        try {
            await activate(injected)
        } catch (error) {
            console.log('Error connecting: ', error)
        }
    }

    // Disconnect from Metamask wallet
    const disconnect = async () => {
        console.log('Deactivating...')
        try {
            await deactivate()
        } catch(error) {
            console.log('Error on disconnecting: ', error)
        }
    }

    const values = useMemo(
        () => ({
            isActive,
            account,
            isLoading,
            connect,
            disconnect
        }),
        [isActive, isLoading]
    )

    return <MetaMaskContext.Provider value={values}>{children}</MetaMaskContext.Provider>
}

export default function useMetaMask() {
    const context = React.useContext(MetaMaskContext)

    if (context === undefined) {
        throw new Error('useMetaMask hook must be used with a MetaMaskProvider component')
    }

    return context
}