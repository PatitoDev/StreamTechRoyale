import { Image, ImageProps } from '@mantine/core';
import { Sponsor } from '@streamtechroyale/models';

export interface SponsorProps extends ImageProps {
    sponsor: Sponsor
}

const SponsorImageMap:Record<Sponsor, string> = {
    'Codealo': 'codealo-logo.png',
    'Devtalles': 'devtalles.png',
    'Donweb Cloud': 'donweb azul.png'
};

const SponsorImage = ({sponsor, ...props}: SponsorProps) => {

    const image = SponsorImageMap[sponsor];

    return (
        <Image bg={sponsor === 'Devtalles' ? 'dark' : 'inherit'} src={image} alt={sponsor} {...props} />
    );
};

export default SponsorImage;