import { auth, loaders, resolver } from '@iden3/js-iden3-auth';
import { NextApiHandler } from 'next';

import { requestMap } from '@/lib/server/requestMap';

// Callback verifies the proof after sign-in callbacks
const handler: NextApiHandler = async (req, res) => {
  // Get session ID from request
  const sessionId = req.query.sessionId;

  console.log(req.query, req.body, req.query.sessionId);

  // get JWZ token params from the post request
  const raw = req.body.token;
  const tokenStr = raw.toString().trim();

  // fetch authRequest from sessionID
  const authRequest = requestMap.get(`${sessionId}`);

  // Locate the directory that contains circuit's verification keys
  const verificationKeyloader = new loaders.FSKeyLoader('../keys');
  const sLoader = new loaders.UniversalSchemaLoader('ipfs.io');

  // Add Polygon RPC node endpoint - needed to read on-chain state and identity state contract address
  const ethStateResolver = new resolver.EthStateResolver(
    '<RPCNODEURL>',
    '0xb8a86e138C3fe64CbCba9731216B1a638EEc55c8'
  );

  // EXECUTE VERIFICATION
  const verifier = new auth.Verifier(
    verificationKeyloader,
    sLoader,
    ethStateResolver
  );

  try {
    const authResponse = await verifier.fullVerify(tokenStr, authRequest);
    return res.status(200).json({
      message:
        'user with ID: ' + authResponse.from + ' Succesfully authenticated',
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

export default handler;
