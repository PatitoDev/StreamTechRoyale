import { Button, Group, Modal, ModalProps, Text } from '@mantine/core';
import { CreatorDto } from '@streamtechroyale/models';
import { useState } from 'react';
import { Api } from '../../../api';
import { useAuth } from '../../../context/AuthContext/useAuth';

export interface RepresentationModalProps extends ModalProps {
    creator: CreatorDto
}

const RepresentationModal = ({creator, ...props}: RepresentationModalProps) => {
    const { auth, authenticate } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onYesClick = async () => {
        if (!auth) {
            authenticate();
            return;
        }
        setIsLoading(true);
        await Api.setUserRepresentation(auth.token, creator.id);
        setIsLoading(false);
        props.onClose();
    };

    return (
        <Modal {...props} title={`Estas seguro que quieres que ${creator.name} te represente`}>
            <Text>
                Si {creator.name} gana, el premio sera sorteado entre los --.
            </Text>

            <Group mt={10} position='center'>
                <Button loading={isLoading} onClick={onYesClick}>Si</Button>
                <Button loading={isLoading} onClick={props.onClose} variant='outline'>No</Button>
            </Group>
        </Modal>
    );
};

export default RepresentationModal;