import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AiService } from '../service/AIService';
import { AiDTO } from '../AIDTO/aiDTO';
import { unexpectedErrorOccurred } from '../common/aiMessage';
import { AuthGuard } from 'src/midlewares/authenticationMiddleware';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @UseGuards(AuthGuard)
  @Post('ask')
  async askAI(@Body() aiDTO: AiDTO, @Res() res) {
    try {
      const { message } = aiDTO;
      const aiResponse = await this.aiService.getAIResponse(message);

      if (aiResponse.status) {
        return res.status(200).send({
          status: true,
          message: aiResponse.message,
          data: aiResponse.data,
        });
      } else {
        return res.status(500).send({
          status: false,
          message: aiResponse.message,
          error: aiResponse.error,
          data: null,
        });
      }
    } catch (error: any) {
      return res.status(500).send({
        status: false,
        message: unexpectedErrorOccurred,
        error: error.message,
        data: null,
      });
    }
  }
}
