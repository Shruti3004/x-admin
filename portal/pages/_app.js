import { useState } from "react";
import "../styles/globals.css";
import { Provider } from "next-auth/client";
import { ToastProvider } from "react-toast-notifications";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "styles/theme";
import GlobalStyles from "styles/globalStyle";

function MyApp({ Component, pageProps }) {
  // const [theme, setTheme] = useState("light");
  // const toggleTheme = () => {
  //   theme == "light" ? setTheme("dark") : setTheme("light");
  // };
  return (
    <ToastProvider
      autoDismiss={true}
      autoDismissTimeout={4000}
      placement="bottom-center"
    >
      {/* <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}> */}
        {/* <GlobalStyles /> */}
        {/* <button onClick={toggleTheme} className="switch-theme">
          {theme === "light" ? (
            <i className="fas fa-sun fa-2x light-theme-icon" />
          ) : (
            <i class="fas fa-moon fa-2x" />
          )}
        </button> */}
        <Provider session={pageProps.session}>
          <Component {...pageProps} />
        </Provider>
      {/* </ThemeProvider> */}
    </ToastProvider>
  );
}

export default MyApp;
