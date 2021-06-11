import { Avatar, Flex, Heading, Link } from "@chakra-ui/react";
import { Link as WLink } from "wouter";
import {} from "@chakra-ui/icons";
export const Header = () => (
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
            <Link as={WLink} href="/">
                Flowtr Panel
            </Link>
        </Heading>
        <Flex
            className="header-navigation"
            justifyContent="center"
            ml="auto"
            alignItems="center"
        >
            {sessionStorage.getItem("token") !== null && (
                <Link as={WLink} href="/deployment/all" mr="1.5em">
                    Deployments
                </Link>
            )}
            <Link
                as={WLink}
                mr="1.5em"
                href={
                    sessionStorage.getItem("token") !== null
                        ? "/dashboard/profile"
                        : "/dashboard/login"
                }
            >
                <Avatar alt="Dashboard" />
            </Link>
        </Flex>
    </Flex>
);
