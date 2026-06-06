const SpfService = require(
    './spf.service'
);

class SpfController {
    async GetSPF(req, res) {
        try {
            const result =
                await SpfService.getSPF(
                    req.user.user_id
                );

            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }
}

module.exports = new SpfController();