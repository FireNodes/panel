import {
    Avatar,
    Button,
    Flex,
    Heading,
    Link,
    MenuList,
    Text,
} from "@chakra-ui/react";
import { Link as WLink, useLocation } from "wouter";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem } from "@chakra-ui/react";
import React, { useEffect, useState } from "preact/compat";
import { storage } from "../lib/api";
import { StorageChangeListener } from "@flowtr/panel-sdk";

export const Header = () => {
    // const [token] = usePersistedState<string | undefined>("token", undefined);
    const [token, setToken] = useState<string | undefined>(undefined);

    const handleStorage: StorageChangeListener = (changes) => {
        const newVal = changes["token"].newValue;
        if (
            newVal !== undefined &&
            newVal !== null &&
            changes["token"].oldValue !== newVal
        )
            setToken(newVal);
        else setToken(undefined);
    };

    useEffect(() => {
        setToken(storage.get("token").token);

        storage.onChanged.addListener(handleStorage);

        return () => {
            if (storage.onChanged.hasListener(handleStorage))
                storage.onChanged.removeListener(handleStorage);
        };
    }, [token]);

    const [, setLocation] = useLocation();
    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            minHeight="1.5em"
            p="1.5em"
            mb="1.5em"
            width="100%"
            backgroundColor="blackAlpha.300"
        >
            <Heading color="pink.500" fontWeight="bold">
                <Link fontFamily="Open Sans" as={WLink} href="/">
                    Flowtr
                </Link>
            </Heading>
            <Flex
                className="header-navigation"
                justifyContent="center"
                ml="auto"
                alignItems="center"
            >
                <Menu>
                    <MenuButton>
                        <Avatar size="md" alt="Links" mb="0.5em" />
                    </MenuButton>
                    <MenuList>
                        {token && (
                            <MenuItem
                                onClick={() =>
                                    setLocation("/dashboard/deployments")
                                }
                            >
                                Deployments
                            </MenuItem>
                        )}
                        <MenuItem
                            onClick={() =>
                                setLocation(
                                    token !== undefined
                                        ? "/dashboard/profile"
                                        : "/dashboard/login"
                                )
                            }
                        >
                            {token ? "Profile" : "Login"}
                        </MenuItem>
                        {token && (
                            <MenuItem
                                onClick={() => {
                                    storage.remove("token");
                                    setLocation("/dashboard/login");
                                }}
                            >
                                Log Out
                            </MenuItem>
                        )}
                    </MenuList>
                </Menu>
                <Flex
                    ml="1.5em"
                    className="avatar"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="row"
                ></Flex>
            </Flex>
        </Flex>
    );
};
