import {
    ChakraProvider,
    ColorModeProvider,
    Flex,
    Heading,
    Text,
} from "@chakra-ui/react";
import { Router, Route } from "wouter";
import { theme } from "../lib/theme";
import { Header } from "./header";
import { Profile } from "./profile";
import { Login } from "./login";
import { ToastContainer } from "react-toastify";

export const Layout = () => (
    <Router>
        <ChakraProvider theme={theme}>
            <ColorModeProvider options={theme.config}>
                <Header />
                <Flex
                    justifyContent="flex-start"
                    alignItems="center"
                    flexDirection="column"
                    p="1em"
                    height="100%"
                >
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        pauseOnHover
                    />
                    <Route path="/dashboard/login">
                        <Login />
                    </Route>
                    <Route path="/dashboard/profile">
                        <Profile />
                    </Route>
                </Flex>
            </ColorModeProvider>
        </ChakraProvider>
    </Router>
);
