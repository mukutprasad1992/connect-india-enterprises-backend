import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
    AIResponseRetrievedSuccessfully,
    APIKeyNotProvided,
    failedToGetAIResponse,
    invalidResponseFromAI,
    noMessageContentFound
} from '../common/aiMessage';

@Injectable()
export class AiService {
    async getAIResponse(message: string): Promise<{
        status: boolean;
        message: string;
        data: string | null;
        error?: string;
    }> {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return {
                status: false,
                message: APIKeyNotProvided,
                data: null,
                error: APIKeyNotProvided,
            };
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'user',
                            content: message,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data?.choices?.[0]?.message?.content) {
                return {
                    status: true,
                    message: AIResponseRetrievedSuccessfully,
                    data: response.data.choices[0].message.content.trim(),
                };
            } else {
                return {
                    status: false,
                    message: invalidResponseFromAI,
                    data: null,
                    error: noMessageContentFound,
                };
            }
        } catch (error) {
            return {
                status: false,
                message: failedToGetAIResponse,
                data: null,
                error: error.message,
            };
        }
    }
}
