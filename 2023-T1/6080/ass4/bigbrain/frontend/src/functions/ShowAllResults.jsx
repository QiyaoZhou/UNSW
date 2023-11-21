import React from 'react';
import { Grid, Paper } from '@mui/material';
import { XYPlot, XAxis, YAxis, VerticalBarSeries, HorizontalGridLines, VerticalGridLines } from 'react-vis';

const ShowAllResults = ({ averageMark, rank, accuracy, spendTime }) => {
  const accuracyList = accuracy.map(item => {
    return {
      x: item.questionId,
      y: item.accuracy
    }
  })
  const spendTimeList = spendTime.map(item => {
    return {
      x: item.questionId,
      y: item.spendTime
    }
  })
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} >
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 800,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Average points:{averageMark}</h2>
            <div>
              <h2 style={{ textAlign: 'center' }}>Top Rank:</h2>
              {rank.length > 0 && rank.map((item, index) => (
                <h2 key = {index} style={{ color: 'blue', textAlign: 'center' }}>{`${item.name}    :   ${item.points} Points`}</h2>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Percentage correct for each question</h4>
            <h4>Average time spent on each question</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <XYPlot xType="ordinal" width={300} height={300}>
              <HorizontalGridLines />
              <VerticalGridLines />
              <XAxis />
              <YAxis />
              <VerticalBarSeries data={accuracyList} />
            </XYPlot>
            <XYPlot xType="ordinal" width={300} height={300}>
              <HorizontalGridLines />
              <VerticalGridLines />
              <XAxis />
              <YAxis />
              <VerticalBarSeries data={spendTimeList} />
            </XYPlot>
          </div>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default ShowAllResults;
