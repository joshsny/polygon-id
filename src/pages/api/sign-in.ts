import { auth } from '@iden3/js-iden3-auth';
import { DateTime } from 'luxon';
import { NextApiRequest, NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { requestMap } from '@/lib/server/requestMap';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const age = req.query.age ? parseInt(req.query.age as string) : 18;
  const countryCode = req.query.country
    ? parseInt(req.query.country as string)
    : undefined;

  const mode: 'age' | 'country' =
    (req.query.mode as 'age' | 'country') ?? 'age';
  // Audience is verifier id
  const hostUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://polygon-id.vercel.app'
      : 'http://localhost:3000';
  const sessionId = 1;
  const callbackURL = '/api/callback';
  const audience = '1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ';

  const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

  // Generate request for basic authentication
  const request = auth.createAuthorizationRequestWithMessage(
    'test flow',
    'message to sign',
    audience,
    uri
  );

  request.id = '7f38a193-0918-4a48-9fac-36adfdb8b542';
  request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b542';

  const birthDate = DateTime.now().minus({ years: age });

  // Add request for a specific proof
  const proofRequest =
    mode === 'age'
      ? {
          id: 1,
          circuit_id: 'credentialAtomicQuerySig',
          rules: {
            query: {
              allowedIssuers: ['*'],
              schema: {
                type: 'AgeCredential',
                url: 'https://schema.polygonid.com/jsonld/kyc.json-ld',
              },
              req: {
                birthDay: {
                  $lt: parseInt(birthDate.toFormat('yyyyMMdd')), // bithDay field less then 2000/01/01
                },
              },
            },
          },
        }
      : {
          id: 1,
          circuit_id: 'credentialAtomicQuerySig',
          rules: {
            query: {
              allowedIssuers: ['*'], // ID of the trusted issuer
              schema: {
                type: 'CountryOfResidenceCredential',
                url: 'https://schema.polygonid.com/jsonld/kyc.json-ld',
              },
              req: {
                countryCode: {
                  $eq: countryCode,
                },
              },
            },
          },
        };

  const scope = request.body.scope ?? [];
  request.body.scope = [...scope, proofRequest];

  // Store auth request in map associated with session ID
  requestMap.set(`${sessionId}`, request);

  logger(request);

  return res.status(200).json(request);
}
