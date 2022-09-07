import type {NextPage} from 'next'
import Head from 'next/head'
import Appeals from "../components/normal/Appeals/Appeals";
import React, {useEffect, useState} from "react";
import {getToken} from "../helpers/TokenHelper";
import {UserToken} from "../store/user";

const Home: NextPage = () => {

    useEffect(() => {
        if (getToken().length > 1) {
            UserToken(getToken())
        }


    }, [])

    const [tshow, setTshow] = useState(true)
    return (
        <div className={'bg-background h-full'}>
            <Head>
                <title>Unimun</title>
                <meta name="description" content="Unimun"/>
            </Head>
            <main className={'h-full'}>
                <Appeals/>
            </main>
        </div>
    )
}

export default Home
