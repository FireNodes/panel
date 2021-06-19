import { Flex, Text, Heading, Button } from "@chakra-ui/react";
import { FC } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { IUser, ProfileResponse, toTitleCase } from "@flowtr/panel-sdk";
import { api, handleError, storage } from "../lib/api";
import { useLocation } from "wouter";

export const Profile: FC<Record<string, unknown>> = () => {
    const [user, setUser] = useState<IUser | undefined>(undefined);
    const [, setLocation] = useLocation();

    useEffect(() => {
        api.getProfile()
            .then((res) => {
                setUser(res.data.user);
            })
            .catch(() => setLocation("/dashboard/login"));
    }, []);

    return (
        <Flex flexDir="column" justifyContent="center" alignItems="center">
            <Heading as="h2" mb="0.5em">
                Welcome, {toTitleCase(user?.username)}
            </Heading>
        </Flex>
    );
};
