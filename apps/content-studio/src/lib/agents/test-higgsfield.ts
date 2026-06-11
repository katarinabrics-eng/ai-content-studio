import { generateImageFromText } from './higgsfield'

async function test() {
  console.log('Testing Higgsfield API...')
  console.log('API Key prefix:', process.env.HIGGSFIELD_API_KEY?.slice(0, 8))
  try {
    const result = await generateImageFromText({
      prompt: 'minimalist workspace, soft natural light, clean desk, professional photography',
      aspectRatio: '1:1',
      resolution: '720p',
    })
    console.log('✅ Success!')
    console.log('request_id:', result.request_id)
    console.log('status_url:', result.status_url)
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

test()
