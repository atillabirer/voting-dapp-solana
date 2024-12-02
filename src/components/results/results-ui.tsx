import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { valueFormatter, useCandidateScores } from './results-data-access';

export function ResultsChart() {
    const size = {
        width: 500,
        height: 300,
    };

    const candidates_scores: any = useCandidateScores()

    const data = {
        data: candidates_scores,
        valueFormatter,
    };

    return (
        <PieChart
            series={[
                {
                    arcLabel: (item) => `${item.value}%`,
                    arcLabelMinAngle: 44,
                    arcLabelRadius: '60%',
                    ...data,
                },
            ]}
            slotProps={{
                legend: {
                    labelStyle: {
                        fontSize: 14,
                        fill: '#A6ADBB',
                    },
                },
            }}
            sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'white',
                },
            }}
            {...size}
        />
    );
}