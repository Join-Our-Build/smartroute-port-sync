import { createHmac, timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
	const secret = process.env.LINEAR_WEBHOOK_SECRET
	if (!secret) {
		return new Response('LINEAR_WEBHOOK_SECRET not configured', { status: 503 })
	}

	const raw = await req.text()
	const signature = req.headers.get('linear-signature') ?? ''
	const expected = createHmac('sha256', secret).update(raw).digest('hex')
	const sigBuf = Buffer.from(signature)
	const expBuf = Buffer.from(expected)
	if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
		return new Response('invalid signature', { status: 401 })
	}

	revalidatePath('/')
	return Response.json({ revalidated: true })
}
