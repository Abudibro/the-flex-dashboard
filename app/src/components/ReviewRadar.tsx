import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

type Props = {
  data: { subject: string; A: number }[];
};

const ReviewRadar: React.FC<Props> = ({ data }) => {
  return (
    <Paper elevation={1} sx={{ width: '100%', height: 380, p: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6">Category Radar</Typography>
        <Typography variant="body2" color="text.secondary">Average scores per category</Typography>
      </Box>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius={100} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar name="Average" dataKey="A" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ReviewRadar;
