import React, { useContext } from "react";
import Callout from "plaid-threads/Callout";
import Button from "plaid-threads/Button";
import InlineLink from "plaid-threads/InlineLink";

import Link from "../Link";
import Context from "../../Context";

import styles from "./index.module.scss";

const Header = () => {
  const {
    itemId,
    accessToken,
    linkToken,
    linkSuccess,
    isItemAccess,
    backend,
    linkTokenError,
    isPaymentInitiation,
  } = useContext(Context);

  return (
    <div className={styles.grid}>
      <h3 className={styles.title}></h3>

      {!linkSuccess ? (
        <>
          <div>
            <h4 className={styles.subtitle}>
              Welcome to ZK Open Banking
            </h4>
            <h5>
              This protocol will help ypu create zero knowledge proofs of your banking data! In this little dapp example, you will generate a zkp to proof to your landlord that you have more than 1 USD in you bank account balance so you can rent the house.
            </h5>
            <p>
              Wallet:
            </p>
            <br/>
          </div>
          {/* message if backend is not running and there is no link token */}
          {!backend ? (
                  <Callout warning>
                    Unable to fetch link_token: please make sure your backend server
              is running and that your .env file has been configured with your
              <code>PLAID_CLIENT_ID</code> and <code>PLAID_SECRET</code>.
            </Callout>
          ) : /* message if backend is running and there is no link token */
          linkToken == null && backend ? (
            <Callout warning>
              <div>
                Unable to fetch link_token: please make sure your backend server
                is running and that your .env file has been configured
                correctly.
              </div>
              <div>
                If you are on a Windows machine, please ensure that you have
                cloned the repo with{" "}
                <InlineLink
                  href="https://github.com/plaid/quickstart#special-instructions-for-windows"
                  target="_blank"
                >
                  symlinks turned on.
                </InlineLink>{" "}
                You can also try checking your{" "}
                <InlineLink
                  href="https://dashboard.plaid.com/activity/logs"
                  target="_blank"
                >
                  activity log
                </InlineLink>{" "}
                on your Plaid dashboard.
              </div>
              <div>
                Error Code: <code>{linkTokenError.error_code}</code>
              </div>
              <div>
                Error Type: <code>{linkTokenError.error_type}</code>{" "}
              </div>
              <div>Error Message: {linkTokenError.error_message}</div>
            </Callout>
          ) : linkToken === "" ? (
            <div className={styles.linkButton}>
              <Button large disabled>
                Loading...
              </Button>
            </div>
          ) : (
            <div className={styles.linkButton}>
              <Link />
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <h4 className={styles.subtitle}>
              Welcome to ZK Open Banking
            </h4>
            <h5>
              This protocol will help ypu create zero knowledge proofs of your banking data! In this little dapp
              example, you will generate a zkp to proof to your landlord that you have more than 1 USD in you bank
              account balance so you can rent the house.
            </h5>
            <p>
              Wallet:
            </p>
            <br/>
          </div>
        </>
      )}
    </div>
  );
};

Header.displayName = "Header";

export default Header;
