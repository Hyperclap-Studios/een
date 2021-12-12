import {CardColor, CardValue} from "../../types";
import {MdBlock, MdFlipCameraAndroid} from "react-icons/md";
import React from "react";
import './Card.scss';

interface ICardProps {
    color: CardColor;
    value: CardValue;
    size?: CardSize;
}

type CardSize = 'small' | 'medium' | 'large';

const cardSegments = <>
    <div className={'card_segment tl'}/>
    <div className={'card_segment tr'}/>
    <div className={'card_segment bl'}/>
    <div className={'card_segment br'}/>
</>;

export default function Card({color, value, size = 'medium'}: ICardProps) {
    const getRenderedValue = () => {
        switch (value) {
            case 'reverse':
                return <MdFlipCameraAndroid />;
            case 'skip':
                return <MdBlock />;
            case 'pickColor':
                return <>
                    {cardSegments}
                </>;
            case '+4':
                return <>
                    {cardSegments}
                    <div className={'card_value'}>{value}</div>
                </>;
            case 'none':
                return '';
            default:
                return <>{value}</>;
        }
    };

    return (
        <div className={`card ${color} ${size}`}>
            {getRenderedValue()}
        </div>
    );
}