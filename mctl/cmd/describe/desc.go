package describe

import (
	"fmt"
	"github.com/kris-nova/logger"
	"github.com/spf13/cobra"
	"mctl/cmd"
	"strings"
)

var TileSpec = &cobra.Command{
	Use:   "tile",
	Short: "\tDescribe the specification of Tile in the Repo.",
	Long:  "\tDescribe the specification of Tile in the Repo.",
	Run: func(c *cobra.Command, args []string) {

		addr, _ := c.Flags().GetString("addr")
		name, _ := c.Flags().GetString("name")
		version, _ := c.Flags().GetString("version")
		buf, err := cmd.RunGetByVersion(addr, fmt.Sprintf("tile/%s/%s", strings.ToLower(name), version))
		if err != nil {
			logger.Warning("%s\n", err)
			return
		}
		logger.Info("%s\n", string(buf))

	},
}

var HuSpec = &cobra.Command{
	Use:   "hu",
	Short: "\tDescribe the specification of Tile in the Repo.",
	Long:  "\tDescribe the specification of Tile in the Repo.",
	Run: func(c *cobra.Command, args []string) {
		addr, _ := c.Flags().GetString("addr")
		name, _ := c.Flags().GetString("name")
		version, _ := c.Flags().GetString("version")
		buf, err := cmd.RunGetByVersion(addr, fmt.Sprintf("hu/%s/%s", strings.ToLower(name), version))
		if err != nil {
			logger.Warning("%s\n", err)
			return
		}
		logger.Info("%s\n", string(buf))
	},
}

var Desc = &cobra.Command{
	Use:   "describe",
	Short: "\tDescribe the specification of Hu or Tile in the Repo.",
	Long:  "\tDescribe the specification of Hu or Tile in the Repo.",
}

func init() {
	Desc.PersistentFlags().StringP("name", "n", "", "name of Hu/Tile")
	Desc.PersistentFlags().StringP("version", "v", "", "version of Hu/Tile ")
	Desc.AddCommand(HuSpec, TileSpec)

	if err := Desc.MarkPersistentFlagRequired("name"); err != nil {
		logger.Warning("%s\n", err)
	}
	if err := Desc.MarkPersistentFlagRequired("version"); err != nil {
		logger.Warning("%s\n", err)
	}
}
