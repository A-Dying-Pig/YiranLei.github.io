<br>
# DPDK and Pktgen Installation Tutorial

Last update: 2022.1.8

> This tutorial shows how to install DPDK and DPDK application- Pktgen from scratch. The tutorial is tested on CentOS 7.

### Some useful link:

* DKDK Document: http://doc.dpdk.org/guides/linux_gsg/
* Pktgen Document: https://pktgen-dpdk.readthedocs.io/en/latest/getting_started.html
* `igb_uio`: https://doc.dpdk.org/dts/gsg/usr_guide/igb_uio.html

# DPDK

The installation of DPDK consists of:

*  check NIC's Compatiblity with DPDK

* download and install dependencies and DPDK

To build and run a DPDK program:

* set up hugepage
* bind the NIC to the specific drivers

## Check NIC's Compatibility with DPDK

* check the driver of NIC

  ```shell
  ifconfig	# check the interface through which DPDK is about to send packets
  ethtool -i [INTERFACE NAME]  # check the driver of the NIC
  ```

  if the NIC is not shown as an interface,  get the NIC name and find the corresponding driver:

  ```shell
  lspci       # find NIC name
  dmesg | grep -i [NIC NAME] # get the driver for the NIC
  ```

* check whether the NIC is supported by DPDK by checking whether its driver is on the list.

  The list: https://core.dpdk.org/supported/

## Download and Install Dependencies and DPDK

* go to https://core.dpdk.org/download/ and download DPDK:

  ```shell
  wget https://fast.dpdk.org/rel/dpdk-21.11.tar.xz
  tar xf dpdk-21.11.tar.xz
  cd dpdk-21.11
  ```

  configure, build, install DPDK

  ``` 
  meson build
  ninja -C build
  cd build
  sudo ninja install
  sudo ldconfig
  ```

  `meson build` reports a list of drivers, libraries that are (not) going to be built and the reasons why they are not . Install the missing dependencies from the list.

  If the machine supports `NUMA`, `NUMA` library (i.e.,`libnuma-dev` aka `numactl-devel`)  should be installed.

* set `pkg-config` tool.

  ```shell
  export PKG_CONFIG_PATH=[directory where libdpdk.pc is located]
  ```

  or write to the bash file

  ```shell
  sudo vim /etc/bashrc
  # add in the last line
  PKG_CONFIG_PATH=[directory where libdpdk.pc is located]
  ```

* compile a DPDK program

  ```shell
  cd dpdk-21.11/examples/helloworld
  make
  ```

## Set up Hugepages

* ```
  echo 1024 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
  ```

  on a `NUMA` machine, pages should be allocated explicitly on separate nodes:

  ```shell
  echo 1024 | sudo tee /sys/devices/system/node/node0/hugepages/hugepages-2048kB/nr_hugepages
  echo 1024 | sudo tee /sys/devices/system/node/node1/hugepages/hugepages-2048kB/nr_hugepages
  ```

* or:

  ```shell
  sudo ./dpdk-21.11/usertools/dpdk-hugepages.py
  sudo ./dpdk-21.11/usertools/dpdk-hugepages.py -p 1G --setup 2G
  ```

## Bind the NIC to the Specific Drivers

DPDK supports **THREE** drivers: `vfio-pci`, `igb_uio`, `uio_pci_generic`. NIC has to be bound to one of the three drivers. 

`device_id` , e.g., `0000:82:00.1`, is used to identify any device connected to the board. First, check the `device_id`: 

```
lspci | grep -i [NIC NAME]
```

In order to bind a NIC to a new driver, unbind the NIC from the original driver and then bind it to the new one. With the `device_id`, there are two ways to bind the driver.

* **Script Binding**

  ```shell
  sudo ./dpdk-21.11/usertools/dpdk-devbind -u [DEVICE_ID]
  sudo ./dpdk-21.11/usertools/dpdk-devbind -b [DRIVER] [DEVICE_ID]
  # the following is an example:
  sudo ./dpdk-21.11/usertools/dpdk-devbind -u 0000:82:00.1
  sudo ./dpdk-21.11/usertools/dpdk-devbind -b uio_pci_generic 0000:82:00.1
  ```

  check 1) which driver (`vfio-pci`, `igb_uio` or`uio_pci_generic`) should be bound to the NIC, and 2) whether the NIC is successfully bound with the following script:

  ```shell
  sudo ./dpdk-21.11/usertools/dpdk-devbind -s
  # example result
  Network devices using DPDK-compatible driver
  ============================================
  0000:82:00.1 '82599ES 10-Gigabit SFI/SFP+ Network Connection 10fb' drv=uio_pci_generic unused=ixgbe
  
  Network devices using kernel driver
  ===================================
  0000:01:00.0 'NetXtreme BCM5720 2-port Gigabit Ethernet PCIe 165f' if=em1 drv=tg3 unused=uio_pci_generic *Active*
  0000:01:00.1 'NetXtreme BCM5720 2-port Gigabit Ethernet PCIe 165f' if=em2 drv=tg3 unused=uio_pci_generic
  0000:02:00.0 'NetXtreme BCM5720 2-port Gigabit Ethernet PCIe 165f' if=em3 drv=tg3 unused=uio_pci_generic
  0000:02:00.1 'NetXtreme BCM5720 2-port Gigabit Ethernet PCIe 165f' if=em4 drv=tg3 unused=uio_pci_generic
  0000:82:00.0 '82599ES 10-Gigabit SFI/SFP+ Network Connection 10fb' if=p4p1 drv=ixgbe unused=uio_pci_generic
  ```

* **Manual Binding**

  * load the corresponding driver into the kernel

  ```shell
  #vfio-pci
  sudo modprobe vfio-pci
  #uio_pci_generic
  sudo modprobe uio_pci_generic
  #igb_uio
  sudo modprobe uio
  sudo insmod igb_uio.ko
  ```

  * unbind a device, append `device_id`to file `/sys/bus/pci/drivers/[DRIVER]/unbind`

  ```bash
  echo -n [DEVICE_ID] | sudo tee -a /sys/bus/pci/drivers/[DRIVER]/unbind
  # example
  echo -n "0000:83:00.0" | sudo tee -a /sys/bus/pci/drivers/uio_pci_generic/unbind
  ```

  * overwrite the file `/sys/bus/pci/devices/[DEVICE_ID]/driver_override` with the name of driver

  ```shell
  echo -n [DRIVER] | sudo tee /sys/bus/pci/devices/[DEVICE_ID]/driver_override
  #example
  echo -n "uio_pci_generic" | sudo tee /sys/bus/pci/devices/0000:83:00.0/driver_override
  ```

  * append `device_id` to file `/sys/bus/pci/drivers/[DRIVER]/bind` 

  ```shell
  echo -n [DEVICE_ID] | sudo tee -a /sys/bus/pci/drivers/[DRIVER]/bind
  # example
  echo -n "0000:83:00.0" | sudo tee -a /sys/bus/pci/drivers/uio_pci_generic/bind
  ```

## Compile Driver `igb_uio`

The driver `igb_uio` is not directly included in the DPDK. It needs to be compiled by the user.

* download `igb_uio`

  ```shell
  git clone http://dpdk.org/git/dpdk-kmods
  ```

* integrate `igb_uio` into DPDK (means going back to DPDK build)

  copy `igb_uio` source codes into `dpdk` source codes

  ```
  cp -r ./dpdk-kmods/linux/igb_uio ./dpdk-21.11/kernel/linux/
  ```

  add `igb_uio` in `dpdk-21.11/kernel/linux/meson.build` subdirs as below:

  ```shell
  subdirs = ['kni', 'igb_uio']
  ```

  create a file of `meson.build` in `dpdk-21.11/kernel/linux/igb_uio/` as below:

  ```shell
  # SPDX-License-Identifier: BSD-3-Clause
  # Copyright(c) 2017 Intel Corporation
  
  mkfile = custom_target('igb_uio_makefile',
          output: 'Makefile',
          command: ['touch', '@OUTPUT@'])
          
  kernel_version = run_command('uname', '-r').stdout().strip()
  kernel_dir = '/lib/modules/' + kernel_version
  
  custom_target('igb_uio',
          input: ['igb_uio.c', 'Kbuild'],
          output: 'igb_uio.ko',
          command: ['make', '-C', kernel_dir + '/build',
                  'M=' + meson.current_build_dir(),
                  'src=' + meson.current_source_dir(),
                  'EXTRA_CFLAGS=-I' + meson.current_source_dir() +
                          '/../../../lib/librte_eal/include',
                  'modules'],
          depends: mkfile,
          install: true,
          install_dir: kernel_dir + '/extra/dpdk',
          build_by_default: true)
  ```

* compile module `igb_uio`. `kernel headers` are needed when compiling a module. Install `kernel headers` according to your linux kernel version.

  in  `meson.build` of the directory`dpdk-21.11`. Enable module building by changing

  ```shell
  if get_option('enable_kmods')
  	subdir('kernel')
  endif
  ```

  to

  ```shell
  subdir('kernel')
  ```

  configure, build, and install DPDK at this time. `igb_uio` will be built.

Now we can run a DPDK program

```
cd dpdk-21.11/examples/helloworld/build
./helloworld
```

# Pktgen

* download and install Pktgen

  * set environment variables required by DPDK

  ```shell
  export RTE_SDK=<DPDKInstallDir>  	#example: export RTE_SDK=/root/dpdk-21.11
  export RTE_TARGET=x86_64-native-linux-gcc
  ```

  ​	or write to bash file, e.g.,  `/etc/bashrc`

  * download and compile Pktgen

  ```shell
  git clone git://dpdk.org/apps/pktgen-dpdk
  cd pktgen-dpdk
  make
  ```

  you may need to modify `meson.build` in the `pktgen-dpdk` folder. Set

  ```shell
  'werror=false'
  add_project_arguments('-std=c99', language: 'c')
  ```

* Run Pktgen

  * bind the NIC to the driver

  * set up hugepage. 

    execute commands introduced in DPDK hughpage setup. 

  ```shell
  sudo vi /etc/sysctl.conf
  # Add to the bottom of the file:
  vm.nr_hugepages=256
  
  sudo vi /etc/fstab
  # Add to the bottom of the file:
  huge /mnt/huge hugetlbfs defaults 0 0
  
  sudo mkdir /mnt/huge
  sudo chmod 777 /mnt/huge
  ```

  * Visit https://pktgen-dpdk.readthedocs.io/en/latest/usage_pktgen.html to check the parameters of Pktgen.

    Note that for a port (=NIC) which is on `NUMA` node `i`, the `RX` and `TX` of the port must be processed by the logical cores (`lcore`) listed on that node. The topology of CPU can be checked by `lstopo` and `page cpu` in Pktgen. 
