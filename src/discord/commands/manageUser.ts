import { Command } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, PermissionsBitField } from "discord.js";

new Command({
    name: "ToManage",
    type: ApplicationCommandType.User,
    async run(interaction) {
        const member = interaction.guild?.members.cache.get(interaction.user.id);

        // Verifique se o usuário está presente e tem permissão de administrador
        if (!member || !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ ephemeral: true, content: "Você não tem permissão para usar este comando." });
            return;
        }

        const { targetId } = interaction;

        const row = createRow(
            new ButtonBuilder({
                customId: `manage/user/${targetId}/alert`,
                label: "Alert",
                style: ButtonStyle.Success
            }),
            new ButtonBuilder({
                customId: `manage/user/${targetId}/ban`,
                label: "Ban",
                style: ButtonStyle.Success
            }),
            new ButtonBuilder({
                customId: `manage/user/${targetId}/kickout`,
                label: "KickOut",
                style: ButtonStyle.Success
            }),
            new ButtonBuilder({
                customId: `manage/user/${targetId}/punishment`,
                label: "Punishment",
                style: ButtonStyle.Success
            }),
            new ButtonBuilder({
                customId: `manage/user/${targetId}/mute`,
                label: "Mute",
                style: ButtonStyle.Success
            })
        );

        await interaction.reply({ ephemeral: true, components: [row] });
    }
});
