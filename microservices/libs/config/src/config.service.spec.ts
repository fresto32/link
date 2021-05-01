import {ConfigService} from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  const nestConfigServiceMock = {
    get: jest.fn().mockReturnValue('hello'),
  };

  beforeEach(async () => {
    // @ts-expect-error: Mocking Nest config service.
    service = new ConfigService(nestConfigServiceMock);
  });

  describe('databaseUrl', () => {
    it('returns the value as specified by the nest config service for a given key', () => {
      const expectedUrl = 'expectedUrl';
      nestConfigServiceMock.get.mockReturnValue(expectedUrl);

      expect(service.get<string>('url')).toEqual(expectedUrl);
    });

    it('throws an error when the nest config service has no value for the key', () => {
      nestConfigServiceMock.get.mockReturnValue(undefined);

      const fn = () => service.get('db.url');
      expect(fn).toThrow(Error);
    });
  });
});
