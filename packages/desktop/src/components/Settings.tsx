import { GearIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useModelDownload } from '@/stores'
import LocationSetting from './LocationSetting'
import ModelsSetting from './ModelsSetting'

export function Settings() {
  useModelDownload();
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost">
          <GearIcon className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div
          className="-mt-6 pt-2 bg-white"
          style={{
            height: 'calc(100vh - 100px)'
          }}
        >
          <Tabs className="flex flex-col h-full" defaultValue="models">
            <TabsList className="grid w-full grid-cols-2 mx-auto w-full max-w-lg">
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            <TabsContent
              className="grow min-h-0 overflow_hidden"
              value="models"
            >
              <ScrollArea className="h-full">
                <div className="mx-auto w-full max-w-screen-md">
                  <ModelsSetting />
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent
              className="grow min-h-0 overflow_hidden"
              value="export"
            >
              <ScrollArea className="h-full">
                <div className="mx-auto w-full max-w-screen-md">
                  <LocationSetting />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default Settings
