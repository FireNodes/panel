import { Button, Circle, Flex, Heading, Text } from "@chakra-ui/react";
import { IDeployment, toTitleCase } from "@flowtr/panel-sdk";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCloudUploadAlt,
    faMinus,
    faRedo,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "wouter";

export const DeploymentList = () => {
    const [containers, setContainers] = useState<IDeployment[]>([]);
    const [reload, setReload] = useState<boolean>(false);
    const [, setLocation] = useLocation();

    useEffect(() => {
        api.getDeployments().then((res) => setContainers(res.data.containers));
    }, [reload]);

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            flexWrap="wrap"
        >
            <Heading as="h2" mb="0.5em">
                Deployment List
            </Heading>
            <Flex
                justifyContent="center"
                alignItems="center"
                flexDirection="row"
                flexWrap="wrap"
            >
                <Button
                    onClick={() => setLocation("/dashboard/deploy")}
                    mb="1.5em"
                    mr="1.5em"
                >
                    <FontAwesomeIcon title="Deploy" icon={faCloudUploadAlt} />
                    <Text ml="0.5em">Deploy</Text>
                </Button>
                <Button onClick={() => setReload(!reload)} mb="1.5em">
                    <FontAwesomeIcon icon={faRedo} />
                    <Text ml="0.5em">Reload</Text>
                </Button>
            </Flex>
            <Flex
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                flexWrap="wrap"
            >
                {containers.length === 0 && <Text>No containers found.</Text>}
                {containers.map((c) => (
                    <Button
                        onClick={() =>
                            setLocation(`/dashboard/deployment/${c.id}`)
                        }
                        mb="1.5em"
                    >
                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="row"
                            minW="25em"
                        >
                            <Text mr="0.5em" ml="0.5em">
                                {toTitleCase(c.name)}
                            </Text>
                            <FontAwesomeIcon icon={faMinus} />
                            <Text mr="0.5em" ml="0.5em">
                                {toTitleCase(c.image.split(":")[0])}
                            </Text>
                            <FontAwesomeIcon icon={faMinus} />
                            <Circle
                                ml="0.5em"
                                mr="0.5em"
                                size="1em"
                                bg={c.status ? "#42f563" : "#f56642"}
                            />
                        </Flex>
                    </Button>
                ))}
            </Flex>
        </Flex>
    );
};
