import {gql, useSubscription} from "@apollo/client";
import {clientChat} from "../apollo-client";

const COMMENTS_SUBSCRIPTION = gql`
    subscription OnNewMessage{
        newMessage{
            id
            type
            text
        }
    }
`;


export const NewMessageNotification = () => {
    const { data, loading, error } = useSubscription(
        COMMENTS_SUBSCRIPTION,
        { client:clientChat}
    );

    if(data){
        console.log(data);
    }

    return (
        <div>
            {loading?
                <h1>loading...</h1>
                :
                error?
                    <h1>{error.message}</h1>
                    :
                    <h1>new message got! show notification in top and then hide as instagram dose</h1>
            }
        </div>
    );
}


