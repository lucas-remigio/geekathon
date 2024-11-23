<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Aws\Bedrock\BedrockClient;

use Aws\BedrockRuntime\BedrockRuntimeClient;

class AwsController extends Controller
{
    protected $client = null;

    public function __construct() {
        // Constructor method, called when a new instance is created
        $this->client = new BedrockRuntimeClient([
            'version' => 'latest',
            'region' => 'us-east-1'
        ]);
    }

    public function extractData(Request $request)
    {
        // Force JSON response
        $request->headers->set('Accept', 'application/json');

        // Validate the incoming request
        $validated = $request->validate([
            'prompt' => 'required|string',
        ]);

        $prompt = $validated['prompt'];

        try {

            // Call Amazon Bedrock for Llama model inference
            $response = $this->client->invokeModel([
                'modelId' => 'mistral.mistral-large-2402-v1:0',
                'body' => json_encode([
                    'prompt' => $prompt,
                    'max_gen_len' => 128,
                    'temperature' => 0.1,
                    'top_p' => 0.9
                ]),
                'accept' => 'application/json',
                'contentType' => 'application/json'
            ]);

            $result = json_decode($response['body'], true);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function test(Request $request)
    {
        return response()->json(['message' => 'Extract Data Endpoint Reached']);
    }
}
