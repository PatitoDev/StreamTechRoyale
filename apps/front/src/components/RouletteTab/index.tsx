import { Text, Button, Flex, Modal } from '@mantine/core';
import { RoulletteDisplayType, RoullettePrize, RoulletteStockChange } from '@streamtechroyale/models';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { WheelData } from 'react-custom-roulette/dist/components/Wheel/types';
import { Api } from '../../api';
import { useAuth } from '../../context/AuthContext/useAuth';
import { useWsContext } from '../../context/wsContext/useWsContext';
import SponsorImage from '../Sponsor';

// fixed auto update on re render
const Roullette = memo(Wheel);

//const TIME_TO_WAIT_IN_SECONDS = 30;
const TIME_TO_WAIT_IN_SECONDS = 1800;

const weightMap:Record<RoulletteDisplayType, number> = {
    'Espera 30m': 6,
    'Gira otra vez!': 4,
    'Accessory': 1,
    'Beca': 1,
    'Gadget': 1,
    'Paquete Cloud': 1,
    'Sorpresa': 1,
};

const RouletteTab = () => {
    const [buttonText, setButtonText] = useState<string>('GIRAR');
    const { auth, authenticate } = useAuth();
    const { subscribeToEvent } = useWsContext();
    const [canSpin, setCanSpin] = useState(true);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [prizes, setPrizes] = useState<Array<WheelData & { type: RoulletteDisplayType }>>([]);
    const restrictionValue = useRef<number | null>(null);
    const [prizeWon, setPrizeWon] = useState<RoullettePrize | null>(null);

    useEffect(() => {
        subscribeToEvent('roullette-stock-change', (event) => {
            if (event.type !== 'roullette-stock-change') return;
            const { content } = event as RoulletteStockChange;
            const prizesMapped = content.map((item) => ({...item, 
                option: item.type,
                optionSize: weightMap[item.type]
            }));
            setPrizes(prizesMapped);
        });
    }, []);

    useEffect(() => {
        (async () => {
            const resp = await Api.getPrizesForRoullette();
            if (!resp.data) return;
            const prizesMapped = resp.data.map((item) => ({...item, 
                option: item.type,
                optionSize: weightMap[item.type]
            }));
            setPrizes(prizesMapped);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!auth) {
                setButtonText('Login para jugar');
                return;
            }
            const result = await Api.getRestriction(auth.token);
            if (!result.data) return;
            restrictionValue.current = result.data.restrictValue;
        })();
    }, [auth]);

    useEffect(() => {
        const onSecond = () => {
            const target = restrictionValue.current;
            if (typeof target !== 'number' && !canSpin) {
                setCanSpin(true);
                setButtonText('GIRAR');
                return;
            }
            if (target === null) return;
            const now = Date.now();
            const diffInSeconds = Math.abs((target - now) / 1000);
            const timeLeft = (TIME_TO_WAIT_IN_SECONDS - diffInSeconds);
            if (timeLeft > 0) {
                setCanSpin(false);
                const minutes = Math.floor(timeLeft / 60);
                const seconds = Math.floor(timeLeft % 60);
                setButtonText(`${minutes}:${seconds}`);
            } else {
                setCanSpin(true);
                setButtonText('GIRAR');
                restrictionValue.current = null;
            }
        };

        const interval = window.setInterval(onSecond, 1 * 1000);
        return () => {
            clearInterval(interval);
        };
    }, [restrictionValue]);

    const handleSpinClick = async () => {
        setCanSpin(false);
        if (!auth) {
            authenticate();
            return;
        }
        if (mustSpin || !auth) return;
        const prize = await Api.playRoullette(auth.token);
        if (!prize.data) return;
        const prizeIndex = prizes.findIndex((item) => item.type === prize.data?.prize.type);
        if (prizeIndex === -1) return;
        setPrizeNumber(prizeIndex);
        setPrizeWon(prize.data.prize);
        if (prize.data.prize.type === 'Gira otra vez!') {
            setCanSpin(true);
        } else {
            restrictionValue.current = (prize.data.restriction);
        }
        setMustSpin(true);
    };

    const onSpinEnd = useCallback(() => {
        setMustSpin(false);
    }, []);

    const bgColors = useMemo(() => (
        ['#739AE5', '#7CF6E0', '#C7FFF5']
    ), []);

    return (
        <Flex direction="column" align="center" gap={20}>
            <Modal opened={!!prizeWon && !mustSpin} onClose={() => setPrizeWon(null)} centered>
                {prizeWon && (prizeWon.type === 'Espera 30m' || prizeWon.type === 'Gira otra vez!') && (
                    <Flex mb="lg" direction="column" gap="1em" align="center">
                        <Text size="2em">{prizeWon.name}</Text>
                    </Flex>
                )}
                {prizeWon && prizeWon.type !== 'Espera 30m' && prizeWon.type !== 'Gira otra vez!' && (
                    <Flex direction="column" gap="1em" align="center">
                        <Text weight="bold" size="2em">Has ganado!</Text>
                        <Text>{prizeWon.name}!</Text>
                        {prizeWon.sponsor && (
                            <>
                                <Text size="1.5em">Patrocinado por</Text>
                                <SponsorImage maw="10em" sponsor={prizeWon.sponsor} />
                            </>
                        )}
                    </Flex>
                )}
            </Modal>

            { prizes.length > 0 && (
                <Roullette
                    fontSize={16}
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={prizes}
                    radiusLineWidth={2}
                    radiusLineColor='white'
                    innerBorderColor='#C7FFF5'
                    outerBorderColor='#739AE5'
                    outerBorderWidth={10}
                    innerBorderWidth={5}
                    backgroundColors={bgColors}
                    onStopSpinning={onSpinEnd}
                />
            )}
            <Button 
                disabled={mustSpin || !canSpin}
                onClick={handleSpinClick}>
                {buttonText}
            </Button>
        </Flex>
    );
};

export default RouletteTab;