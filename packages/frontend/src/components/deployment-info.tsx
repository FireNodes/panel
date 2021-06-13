import { Flex, Heading, Text, Button, Circle } from "@chakra-ui/react";
import { IDeployment } from "@flowtr/panel-sdk";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";

export const DeploymentInfo = (props: { id: string }) => {
    const [deployment, setDeployment] = useState<IDeployment | undefined>(
        undefined
    );
    const [reload, setReload] = useState<boolean>(false);

    const [, setLocation] = useLocation();

    useEffect(() => {
        api.getDeployment(props.id).then(
            (res) =>
                res.data.containers &&
                res.data.containers.length > 0 &&
                setDeployment(res.data.containers[0])
        );
    }, [reload]);

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
        >
            <Button
                onClick={() => setLocation("/dashboard/deployments")}
                mb="1.5em"
            >
                Back to Deployment List
            </Button>
            {deployment ? (
                <Flex
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                    bg="gray.700"
                    p="1.5em"
                    borderRadius="1.5em"
                    mb="1.5em"
                    mr="1.5em"
                >
                    <Button onClick={() => setReload(!reload)} mb="1.5em">
                        <FontAwesomeIcon icon={faRedo} />
                        <Text ml="0.5em">Reload</Text>
                    </Button>
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        mb="0.5em"
                    >
                        <Heading as="h3" fontSize="1.5em">
                            Identifier
                        </Heading>
                        <Text>{deployment.id}</Text>
                    </Flex>

                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        mb="0.5em"
                    >
                        <Heading as="h3" fontSize="1.5em">
                            Status
                        </Heading>
                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="row"
                        >
                            <Text>
                                {deployment.status ? "Running" : "Not Running"}
                            </Text>
                            <Circle
                                ml="0.5em"
                                size="1em"
                                bg={deployment.status ? "#42f563" : "#f56642"}
                            />
                        </Flex>
                    </Flex>

                    {deployment.image && (
                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                            mb="0.5em"
                        >
                            <Heading as="h3" fontSize="1.5em">
                                Image
                            </Heading>
                            <Text>{deployment.image}</Text>
                        </Flex>
                    )}

                    {deployment.name && (
                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                            mb="0.5em"
                        >
                            <Heading as="h3" fontSize="1.5em">
                                Name
                            </Heading>
                            <Text>{deployment.name}</Text>
                        </Flex>
                    )}
                </Flex>
            ) : (
                <Text>Deployment not found.</Text>
            )}
        </Flex>
    );
};
