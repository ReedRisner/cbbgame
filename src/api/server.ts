import cors from 'cors';
import express from 'express';
import teamsRouter from './routes/teams';
import conferencesRouter from './routes/conferences';
import playersRouter from './routes/players';
import coachesRouter from './routes/coaches';
import recruitsRouter from './routes/recruits';
import rankingsRouter from './routes/rankings';
import searchRouter from './routes/search';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/teams', teamsRouter);
app.use('/api/conferences', conferencesRouter);
app.use('/api/players', playersRouter);
app.use('/api/coaches', coachesRouter);
app.use('/api/recruits', recruitsRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/search', searchRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
