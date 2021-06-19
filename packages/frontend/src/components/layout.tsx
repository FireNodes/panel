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
import { DeploymentList } from "./deployment-list";
import { DeployForm } from "./deploy";
import { DeploymentInfo } from "./deployment-info";

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
                    w="100%"
                    h="100%"
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
                    <Route path="/dashboard/deployments">
                        <DeploymentList />
                    </Route>
                    <Route path="/dashboard/deploy">
                        <DeployForm />
                    </Route>
                    <Route path="/dashboard/deployment/:id">
                        {(params: { id: string }) => (
                            <DeploymentInfo id={params.id}></DeploymentInfo>
                        )}
                    </Route>
                </Flex>
            </ColorModeProvider>
        </ChakraProvider>
    </Router>
);
