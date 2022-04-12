export interface AltcoinomySubscription {
    subscription_id: string,
    status:  "subscription_pending" |
        "subscription_submitted" |
        "subscription_onboarded" |
        "subscription_to_be_fixed" |
        "subscription_rejected" |
        "subscription_to_report" |
        "subscription_acknowledged" |
        "subscription_auto_wait_worldcheck" |
        "subscription_auto_acknowledgeable",
    groups: {
        finalization: {
            fields: {
                tokenDeliveryAddress: string,
            }
        }
    },
    payment_status?: [
        {
            currency: string,
            payment_status: "status.cleared" | "status.to_be_checked",
            payment_label: string,
        }
    ],
    nb_token_to_deliver: string,
}