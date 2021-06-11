import {
    ChakraProvider,
    ColorModeProvider,
    Flex,
    Text,
} from "@chakra-ui/react";
import { Router, Route } from "wouter";
import { theme } from "../lib/theme";
import { Header } from "./header";
import { Profile } from "./profile";
import { Login } from "./login";
import { ToastContainer } from "react-toastify";
import { ContainerList } from "./deployment-list";

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
                    <Route path="/">
                        {/*TODO: configurable welcome message*/}
                        <Text fontWeight="bolder" fontSize="110%">
                            Welcome to your new panel instance.
                        </Text>
                    </Route>
                    <Route path="/dashboard/login">
                        <Login />
                    </Route>
                    <Route path="/dashboard/profile">
                        <Profile />
                    </Route>
                    <Route path="/deployment/all">
                        <ContainerList />
                    </Route>
                </Flex>
            </ColorModeProvider>
        </ChakraProvider>
    </Router>
);
