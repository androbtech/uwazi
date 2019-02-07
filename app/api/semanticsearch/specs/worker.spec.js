import Worker from '../worker';
import semanticSearch from '../semanticSearch';

describe('worker', () => {
  beforeEach(() => {
    if (semanticSearch.processSearchLimit.mockClear) {
      semanticSearch.processSearchLimit.mockClear();
    }
  });
  describe('start', () => {
    it('should process documents in the search in batches and emit event when done', (done) => {
      jest.spyOn(semanticSearch, 'processSearchLimit')
      .mockResolvedValueOnce({ status: 'inProgress' })
      .mockResolvedValueOnce({ status: 'inProgress' })
      .mockResolvedValueOnce({ status: 'completed' });

      const searchId = 'search';
      const batchSize = 5;

      const worker = new Worker(searchId, batchSize);
      worker.start();

      worker.on('done', () => {
        expect(semanticSearch.processSearchLimit).toHaveBeenCalledTimes(3);
        expect(semanticSearch.processSearchLimit.mock.calls).toMatchSnapshot();
        done();
      });
    });
    it('should emit update event after each batch is processed', (done) => {
      jest.spyOn(semanticSearch, 'processSearchLimit')
      .mockResolvedValueOnce({ status: 'inProgress' })
      .mockResolvedValueOnce({ status: 'inProgress' })
      .mockResolvedValueOnce({ status: 'completed' });

      const worker = new Worker('search', 5);
      jest.spyOn(worker, 'emit');

      worker.on('done', () => {
        expect(worker.emit.mock.calls).toMatchSnapshot();
        done();
      });

      worker.start();
    });
    it('should stop processing when error occurs and emit error event', (done) => {
      const error = new Error('error');
      jest.spyOn(semanticSearch, 'processSearchLimit')
      .mockResolvedValueOnce({ status: 'inProgress' })
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ status: 'completed' });

      const worker = new Worker('search', 5);
      worker.start();

      worker.on('error', (e) => {
        expect(e).toEqual(error);
        expect(semanticSearch.processSearchLimit).toHaveBeenCalledTimes(2);
        done();
      });
      worker.on('done', () => {
        fail('should emit error');
        done();
      });
    });
  });
});
