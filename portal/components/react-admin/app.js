import { useState, useEffect } from "react";
import { AdminContext, AdminUI, Resource, useDataProvider } from "react-admin";
import buildHasuraProvider, { buildFields } from "ra-data-hasura";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useSession } from "next-auth/client";
import { MuiThemeProvider, createTheme } from "@material-ui/core";
import customTheme from "./theme";
import customLayout from "./layout/";
import customFields from "./customHasura/customFields";
import customVariables from "./customHasura/customVariables";
import { resourceConfig } from "./layout/config";

const App = () => {
  const [dataProvider, setDataProvider] = useState(null);
  const [apolloClient, setApolloClient] = useState(null);
  const [session] = useSession();

  useEffect(() => {
    const hasuraHeaders = {};
    hasuraHeaders.Authorization = `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlVVdzVZdVFWNnd2R29PdmZYNHBxWTdwS18zbyJ9.eyJhdWQiOiJmMGRkYjNmNi0wOTFiLTQ1ZTQtOGMwZi04ODlmODlkNGY1ZGEiLCJleHAiOjE2MzcwMDI5NzYsImlhdCI6MTYzMzQwMjk3NiwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwYzNkOGE3MS0wZGJlLTQ5ZjctOWEzYy05NTdiNjA2MzUzYzUiLCJqdGkiOiJjZTk5ODU2Ni03OGRmLTRlNzEtYTI4ZS0xYWU1Mjg2ZWJlY2EiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsInByZWZlcnJlZF91c2VybmFtZSI6IjExMSIsImFwcGxpY2F0aW9uSWQiOiJmMGRkYjNmNi0wOTFiLTQ1ZTQtOGMwZi04ODlmODlkNGY1ZGEiLCJyb2xlcyI6WyJzY2hvb2wiXSwidXNlckRhdGEiOnsiRkNNLnRva2VuIjoiYzRsc284bEpTNGUzUXF2WG5xblVfbDpBUEE5MWJFQlduN2JHRnQ4ajNzOGNyUGpDTDFNWTU4MUUxUlI0Zlg0NzhBTjRuTmFQdDBNRHE5ckVycmRlaU1jNEpWczBwRDRnX1FYZnQ0cTZGaHpTWXNsS3pfVktfbVFMX1JXTkdVQmFXcXJTNFNscExCRDlVVTRXaW85b0xrN0R2OE9qSGFDNkM5dCIsImFkZHJlc3MiOltdLCJlZHVjYXRpb24iOltdLCJnZW5kZXIiOiIiLCJwaG9uZVZlcmlmaWVkIjpmYWxzZSwic2Nob29sIjoxNTU0NywidWRpc2UiOiIxMTEifSwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInNjaG9vbCIsInRlYWNoZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoic2Nob29sIiwiWC1IYXN1cmEtVXNlci1JZCI6IjExMSIsIlgtSGFzdXJhLUxvZ2luLUlkIjoiMGMzZDhhNzEtMGRiZS00OWY3LTlhM2MtOTU3YjYwNjM1M2M1IiwiWC1IYXN1cmEtU2Nob29sLUlkIjoiMTU1NDciLCJYLUhhc3VyYS1VZGlzZS1JZCI6IjExMSJ9LCJwb2xpY3kiOiJlc2Ftd2FkIn0.LOmXA_Rd4iEEh4v7CubXXJUkdPDwXUbo_2TwRd4QgcvbKbWFJqrJZQ4lw734y924G55lwOBxcpjM4L5xKUqCb8_bHoh_N33UeUjDrPtLxJJcZfB6uVfTvO0DpH44Wz_mjccYceJGO4gyiSvvMEudOW8LK6EzlsnplGr3KQKNcEJu5eTSpdiU-Ht4JXWxQ1gMjPk4ym_el_7fG0a4GzP8yb3hghEIIF8lvL0tFPAyj7nl_d9cEKH3WwcQ_1nmTMMWDDqKzbDDlJelLpfFxoe_u6fvf5FTN_MWtGh2bm3tN2pTA-_LR1yJYAP26M23bMmKjqpC96oOBWARaEED7ZCIMg`;
    if (session.role) hasuraHeaders["x-hasura-role"] = session.role;

    let tempClient = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_HASURA_URL,
      cache: new InMemoryCache(),
      headers: hasuraHeaders,
    });
    async function buildDataProvider() {
      const hasuraProvider = await buildHasuraProvider(
        { client: tempClient },
        {
          buildFields: customFields,
        },
        customVariables
      );
      setDataProvider(() => hasuraProvider);
      setApolloClient(tempClient);
    }
    buildDataProvider();
  }, [session]);

  if (!dataProvider || !apolloClient) return null;
  return (
    <AdminContext dataProvider={dataProvider}>
      <AsyncResources client={apolloClient} />
    </AdminContext>
  );
};
function AsyncResources({ client }) {
  let introspectionResultObjects = client.cache?.data?.data?.ROOT_QUERY?.__schema.types
    ?.filter((obj) => obj.kind === "OBJECT")
    ?.map((elem) => elem.name);
  const resources = resourceConfig;
  let filteredResources = resources;
  if (introspectionResultObjects) {
    filteredResources = resources.filter((elem) =>
      introspectionResultObjects.includes(elem.name)
    );
  }
  if (!resources) return null;
  return (
    <MuiThemeProvider theme={createTheme(customTheme)}>
      <AdminUI disableTelemetry loginPage={false} layout={customLayout}>
        {filteredResources.map((resource) => (
          <Resource
            key={resource.name}
            name={resource.name}
            list={resource.list}
            edit={resource.edit}
            create={resource.create}
            options={{ formUrl: resource.formUrl ? resource.formUrl : "" }}
          />
        ))}
      </AdminUI>
    </MuiThemeProvider>
  );
}

export default App;
